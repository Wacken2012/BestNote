import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import fs from 'fs'

const base = 'http://localhost:5173'

test.setTimeout(120000)

test.describe('SetupWizard accessibility', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // ensure initial setup state so wizard mount is stable
    await page.addInitScript(() => { localStorage.setItem('setupCompleted', 'true') })

    // attach console/pageerror handlers and flush to disk
    const logsPath = 'playwright-report/setup-console.log'
    try { await fs.promises.mkdir('playwright-report', { recursive: true }) } catch (e) {}
    await fs.promises.writeFile(logsPath, `=== Playwright logs for setup (start) ===\n`).catch(()=>{})
    page.on('console', msg => {
      const line = `[console:${msg.type()}] ${msg.text()}\n`
      fs.appendFile(logsPath, line, () => {})
    })
    page.on('pageerror', err => {
      const line = `[pageerror] ${err?.message || err}\n`
      fs.appendFile(logsPath, line, () => {})
    })

    try {
      await page.goto(`${base}/setup`, { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForSelector('.setup-wizard', { timeout: 60000 })
    } catch (err) {
      try { await fs.promises.mkdir('playwright-report', { recursive: true }) } catch (e) {}
      await page.screenshot({ path: 'playwright-report/setup-before-failure.png', fullPage: true }).catch(()=>{})
      try {
        if (!page.isClosed()) {
          const html = await page.content()
          await fs.promises.writeFile('playwright-report/setup-before-failure.html', html).catch(()=>{})
        } else {
          await fs.promises.writeFile('playwright-report/setup-before-failure.html', '<!-- page closed before content could be read -->').catch(()=>{})
        }
      } catch (e) {}
      throw err
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
    expect(accessibilityScanResults.violations.length).toBe(0)
  })
})
