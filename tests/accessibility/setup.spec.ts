import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import fs from 'fs'

const base = 'http://localhost:5173'

test.describe('SetupWizard accessibility', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // ensure initial setup state so wizard mount is stable
    await page.addInitScript(() => { localStorage.setItem('setupCompleted', 'true') })
  await page.goto(`${base}/setup`)
  // capture console and page errors into a file for diagnostics
  const logs: string[] = []
  page.on('console', msg => logs.push(`[console:${msg.type()}] ${msg.text()}`))
  page.on('pageerror', err => logs.push(`[pageerror] ${err?.message || err}`))
  try {
    await page.waitForSelector('.setup-wizard', { timeout: 60000 })
  } catch (err) {
    try { await fs.promises.mkdir('playwright-report', { recursive: true }) } catch (e) {}
    await page.screenshot({ path: 'playwright-report/setup-before-failure.png', fullPage: true }).catch(()=>{})
    await fs.promises.writeFile('playwright-report/setup-before-failure.html', await page.content()).catch(()=>{})
    await fs.promises.writeFile('playwright-report/setup-console.log', logs.join('\n')).catch(()=>{})
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
      await fs.promises.writeFile('playwright-report/setup-failure.html', await page.content()).catch(()=>{})
      throw err
    }
    // aria-live should announce language change
    const live = await page.locator('#a11y-live')
    await expect(live).toHaveText(/English|Deutsch/)
    // document lang updated
    const docLang = await page.evaluate(() => document.documentElement.lang)
    expect(['en','de']).toContain(docLang)

    // axe check
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations.length).toBe(0)
  })
})
