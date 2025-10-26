import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import fs from 'fs'

const base = 'http://localhost:5173'

// Increase timeout for these slower CI runs
test.setTimeout(300000)

test.describe('MemberImport accessibility', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
  // ensure app thinks initial setup was completed and language is set so /import is directly reachable
  await page.addInitScript(() => {
    try { localStorage.setItem('setupCompleted', 'true') } catch (e) {}
    try { localStorage.setItem('lang', 'de') } catch (e) {}
  })

  // attach console/pageerror handlers and flush logs to disk as they arrive so we have diagnostics
  const logsPath = 'playwright-report/member-import-console.log'
  try { await fs.promises.mkdir('playwright-report', { recursive: true }) } catch (e) {}
  // create an early marker file so CI artifact upload finds at least one file
  try { await fs.promises.writeFile('playwright-report/marker-member-import.txt', `start:${Date.now()}`) } catch (e) {}
  await fs.promises.writeFile(logsPath, `=== Playwright logs for member-import (start) ===\n`).catch(()=>{})
    page.on('console', msg => {
      const line = `[console:${msg.type()}] ${msg.text()}\n`
      fs.appendFile(logsPath, line, () => {})
      try {
        if (msg.type() === 'error') fs.appendFile('playwright-report/member-import-console-errors.log', `[console:error] ${msg.text()}\n`, () => {})
      } catch (e) {}
    })
    page.on('pageerror', err => {
      const line = `[pageerror] ${err?.message || err}\n`
      fs.appendFile(logsPath, line, () => {})
      try { fs.appendFile('playwright-report/member-import-console-errors.log', `[pageerror] ${err?.message || err}\n`, () => {}) } catch (e) {}
    })

    // navigate and wait for the main import view to render; capture diagnostics on failure
    try {
      await page.goto(`${base}/import`, { waitUntil: 'networkidle', timeout: 300000 })
      // short delay to let hydration complete
      await page.waitForTimeout(1000)
      // wait for app hydration signal set by the app once i18n and mounting finished
      try {
        await page.waitForFunction(() => (window as any).APP_READY_FOR_TESTS === true, { timeout: 60000 })
      } catch (e) {
        // allow fallback — we still persist debug HTML and diagnostics below
      }
      // persist debug HTML early so artifacts always contain page HTML
      try {
        await fs.promises.mkdir('playwright-report', { recursive: true })
        const debugHtml = await page.content().catch(() => '<!-- content read failed -->')
        await fs.promises.writeFile('playwright-report/debug-import.html', debugHtml).catch(() => {})
        try { const info = test.info(); await info.attach('debug-import.html', { body: Buffer.from(debugHtml), contentType: 'text/html' }) } catch (e) {}
      } catch (e) {}
      // primary selector then fallback
      try {
        await page.waitForSelector('[data-testid="member-import"]', { timeout: 120000 })
      } catch (e) {
        await page.waitForTimeout(1000)
        await page.waitForSelector('main.page.member-import', { timeout: 30000 })
      }
    } catch (err) {
      // try fallback selector once before capturing diagnostics
      try {
        await page.waitForSelector('main.page.member-import', { timeout: 30000 })
      } catch (fallbackErr) {
          try { await fs.promises.mkdir('playwright-report', { recursive: true }) } catch (e) {}
          const pngPath = 'playwright-report/member-import-before-failure.png'
          await page.screenshot({ path: pngPath, fullPage: true }).catch(()=>{})
          try {
            let html = '<!-- content read failed -->'
            if (!page.isClosed()) html = await page.content().catch(() => html)
            await fs.promises.writeFile('playwright-report/member-import-before-failure.html', html).catch(()=>{})
            // attach to Playwright report
            try {
              const info = test.info()
              await info.attach('member-import-before-failure.html', { body: Buffer.from(html), contentType: 'text/html' })
              const buf = await fs.promises.readFile(pngPath).catch(() => null)
              if (buf) await info.attach('member-import-before-failure.png', { body: buf, contentType: 'image/png' })
            } catch(e) {}
          } catch (e) {}
          throw err
      }
    }
  })

  test('upload and preview modal accessibility', async ({ page }: { page: Page }) => {
    // upload a small JSON file
    const filePath = JSON.stringify([{ name: 'Max Mustermann', number: '123' }])
    // be sure the input is present
    await page.waitForSelector('#import-file', { timeout: 60000 })
    try {
      await page.setInputFiles('#import-file', { name: 'members.json', mimeType: 'application/json', buffer: Buffer.from(filePath) })
    } catch (err) {
      // diagnostic: save screenshot and HTML to playwright-report for later triage
      try { await fs.promises.mkdir('playwright-report', { recursive: true }) } catch (e) {}
      await page.screenshot({ path: 'playwright-report/member-import-failure.png', fullPage: true }).catch(()=>{})
      try {
        if (!page.isClosed()) {
          const html = await page.content()
          await fs.promises.writeFile('playwright-report/member-import-failure.html', html).catch(()=>{})
        } else {
          await fs.promises.writeFile('playwright-report/member-import-failure.html', '<!-- page closed before content could be read -->').catch(()=>{})
        }
      } catch (e) {}
      throw err
    }

    // press import
    await page.click('button:has-text("Start import")')

    // modal should appear
  const dialog = page.locator('role=dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveAttribute('aria-modal', 'true')

    // keyboard: Enter confirms
    await page.keyboard.press('Enter')

    // axe check with guaranteed persistence
  await test.step('axe analysis and persistence', async () => {
    try {
      const accessibilityScanResults = await new AxeBuilder({ page: page as any }).analyze()
      try {
        await fs.promises.mkdir('playwright-report', { recursive: true })
        await fs.promises.writeFile('playwright-report/axe-results-member-import.json', JSON.stringify(accessibilityScanResults, null, 2)).catch(() => {})
      } catch (e) {}
      try { const info = test.info(); await info.attach('axe-results-member-import.json', { body: Buffer.from(JSON.stringify(accessibilityScanResults)), contentType: 'application/json' }) } catch (e) {}
      expect(accessibilityScanResults.violations.length).toBe(0)
    } catch (e) {
      try { await fs.promises.mkdir('playwright-report', { recursive: true }) } catch (e2) {}
      try { await fs.promises.writeFile('playwright-report/axe-results-member-import.json', JSON.stringify({ error: ((e as any) && (e as any).message) || String(e) }, null, 2)).catch(() => {}) } catch (e3) {}
      try { const info = test.info(); await info.attach('axe-results-member-import.json', { body: Buffer.from(JSON.stringify({ error: ((e as any) && (e as any).message) || String(e) })), contentType: 'application/json' }) } catch (e4) {}
      throw e
    }
  })

  // attach console-errors if present
  try {
    const errBuf = await fs.promises.readFile('playwright-report/member-import-console-errors.log').catch(() => null)
    if (errBuf) try { const info = test.info(); await info.attach('member-import-console-errors.log', { body: errBuf, contentType: 'text/plain' }) } catch (e) {}
  } catch (e) {}

    // flush any remaining logs
    try { await fs.promises.appendFile('playwright-report/member-import-console.log', `=== Playwright logs (end) ===\n`).catch(()=>{}) } catch (e) {}
  })
})
