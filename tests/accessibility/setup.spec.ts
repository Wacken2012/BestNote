import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const base = 'http://localhost:5173'

test.describe('SetupWizard accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${base}/setup`)
  })

  test('keyboard navigation and aria-live', async ({ page }) => {
    // tab through inputs
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    // choose language (assume select exists)
    const lang = await page.locator('#lang-select')
    await lang.selectOption('en')
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
