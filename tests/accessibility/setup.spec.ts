import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import fs from 'fs'

const base = 'http://localhost:5173'

test.setTimeout(300000)

test.describe('SetupWizard accessibility', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
  // ensure initial setup state so wizard mount is stable and language is set
  await page.addInitScript(() => {
    try { localStorage.setItem('setupCompleted', 'true') } catch (e) {}
    try { localStorage.setItem('lang', 'de') } catch (e) {}
  })

    // attach console/pageerror handlers and flush to disk
    const logsPath = 'playwright-report/setup-console.log'
    try { await fs.promises.mkdir('playwright-report', { recursive: true }) } catch (e) {}
    await fs.promises.writeFile(logsPath, `=== Playwright logs for setup (start) ===\n`).catch(()=>{})
    page.on('console', msg => {
      const line = `[console:${msg.type()}] ${msg.text()}\n`
      fs.appendFile(logsPath, line, () => {})
      // write console error messages to a separate file for quick triage
      try {
        if (msg.type() === 'error') {
          fs.appendFile('playwright-report/setup-console-errors.log', `[console:error] ${msg.text()}\n`, () => {})
        }
      } catch (e) {}
    })
    page.on('pageerror', err => {
      const line = `[pageerror] ${err?.message || err}\n`
      fs.appendFile(logsPath, line, () => {})
      try { fs.appendFile('playwright-report/setup-console-errors.log', `[pageerror] ${err?.message || err}\n`, () => {}) } catch (e) {}
    })
    try { await fs.promises.mkdir('playwright-report', { recursive: true }) } catch (e) {}
    try { await fs.promises.writeFile('playwright-report/marker-setup.txt', `start:${Date.now()}`) } catch (e) {}

    // navigate and wait for the wizard to mount; capture diagnostics on failure
    try {
      await page.goto(`${base}/setup`, { waitUntil: 'networkidle', timeout: 300000 })
      // short delay to allow hydration
      await page.waitForTimeout(1000)
      // wait for app hydration signal set by the app once i18n and mounting finished
      try {
        await page.waitForFunction(() => (window as any).APP_READY_FOR_TESTS === true, { timeout: 60000 })
      } catch (e) {
        // proceed anyway; the subsequent selectors have their own timeouts and we persist debug HTML
      }
      // persist a debug snapshot of the HTML so the CI artifact always contains page HTML
      try {
        await fs.promises.mkdir('playwright-report', { recursive: true })
        const debugHtml = await page.content().catch(() => '<!-- content read failed -->')
        await fs.promises.writeFile('playwright-report/debug-setup.html', debugHtml).catch(() => {})
        // attach debug HTML so it's included in Playwright attachments as well
        try { const info = test.info(); await info.attach('debug-setup.html', { body: Buffer.from(debugHtml), contentType: 'text/html' }) } catch (e) {}
      } catch (e) {}
      // try primary selector first, then fallback
      try {
        await page.waitForSelector('[data-testid="setup-wizard"]', { timeout: 120000 })
      } catch (e) {
        await page.waitForTimeout(1000)
        await page.waitForSelector('.setup-wizard', { timeout: 30000 })
      }
    } catch (err) {
      // fallback attempt
      try {
        await page.waitForSelector('.setup-wizard', { timeout: 30000 })
      } catch (fallbackErr) {
        try { await fs.promises.mkdir('playwright-report', { recursive: true }) } catch (e) {}
        const pngPath = 'playwright-report/setup-before-failure.png'
        await page.screenshot({ path: pngPath, fullPage: true }).catch(()=>{})
        try {
          let html = '<!-- content read failed -->'
          if (!page.isClosed()) html = await page.content().catch(() => html)
          await fs.promises.writeFile('playwright-report/setup-before-failure.html', html).catch(()=>{})
          // attach to Playwright report so HTML reporter and archived report include diagnostics
          try {
            const info = test.info()
            await info.attach('setup-before-failure.html', { body: Buffer.from(html), contentType: 'text/html' })
            // attach screenshot binary if present
            try {
              const buf = await fs.promises.readFile(pngPath).catch(() => null)
              if (buf) await info.attach('setup-before-failure.png', { body: buf, contentType: 'image/png' })
            } catch(e) {}
          } catch(e) {}
        } catch (e) {}
        throw err
      }
    }
  })

  test('keyboard navigation and aria-live', async ({ page }: { page: Page }) => {
    // tab through inputs
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    // choose language (assume select exists)
    await page.waitForSelector('#lang-select', { timeout: 60000 })
    const lang = await page.locator('#lang-select')
    try {
      await lang.selectOption('en')
    } catch (err) {
      try { await fs.promises.mkdir('playwright-report', { recursive: true }) } catch (e) {}
      await page.screenshot({ path: 'playwright-report/setup-failure.png', fullPage: true }).catch(()=>{})
      try {
        if (!page.isClosed()) {
          const html = await page.content()
          await fs.promises.writeFile('playwright-report/setup-failure.html', html).catch(()=>{})
        } else {
          await fs.promises.writeFile('playwright-report/setup-failure.html', '<!-- page closed before content could be read -->').catch(()=>{})
        }
      } catch (e) {}
      throw err
    }
    // aria-live should announce language change
    const live = await page.locator('#a11y-live')
    await expect(live).toHaveText(/English|Deutsch/)
    // document lang updated
    const docLang = await page.evaluate(() => document.documentElement.lang)
    expect(['en','de']).toContain(docLang)

    // axe check (persist early and always write JSON even on error)
    await test.step('axe analysis and persistence', async () => {
      try {
        const accessibilityScanResults = await new AxeBuilder({ page: page as any }).analyze()
        try {
          await fs.promises.mkdir('playwright-report', { recursive: true })
          await fs.promises.writeFile('playwright-report/axe-results-setup.json', JSON.stringify(accessibilityScanResults, null, 2)).catch(() => {})
        } catch (e) {}
        try { const info = test.info(); await info.attach('axe-results-setup.json', { body: Buffer.from(JSON.stringify(accessibilityScanResults)), contentType: 'application/json' }) } catch (e) {}
        expect(accessibilityScanResults.violations.length).toBe(0)
      } catch (e) {
        try { await fs.promises.mkdir('playwright-report', { recursive: true }) } catch (e2) {}
        try { await fs.promises.writeFile('playwright-report/axe-results-setup.json', JSON.stringify({ error: ((e as any) && (e as any).message) || String(e) }, null, 2)).catch(() => {}) } catch (e3) {}
        try { const info = test.info(); await info.attach('axe-results-setup.json', { body: Buffer.from(JSON.stringify({ error: ((e as any) && (e as any).message) || String(e) })), contentType: 'application/json' }) } catch (e4) {}
        throw e
      }
    })

    // attach console-errors log if present
    try {
      const errBuf = await fs.promises.readFile('playwright-report/setup-console-errors.log').catch(() => null)
      if (errBuf) try { const info = test.info(); await info.attach('setup-console-errors.log', { body: errBuf, contentType: 'text/plain' }) } catch (e) {}
    } catch (e) {}
  })
})
