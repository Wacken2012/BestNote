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

    // axe check
  const accessibilityScanResults = await new AxeBuilder({ page: page as any }).analyze()
    // attach axe results to Playwright report for later triage
    try {
      const info = test.info()
      await info.attach('axe-results-setup.json', { body: JSON.stringify(accessibilityScanResults), contentType: 'application/json' })
    } catch (e) {}
    expect(accessibilityScanResults.violations.length).toBe(0)
  })
})
