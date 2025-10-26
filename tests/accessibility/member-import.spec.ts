import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const base = 'http://localhost:5173'

test.describe('MemberImport accessibility', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // ensure app thinks initial setup was completed so /import is directly reachable
    await page.addInitScript(() => { localStorage.setItem('setupCompleted', 'true') })
    await page.goto(`${base}/import`)
  })

  test('upload and preview modal accessibility', async ({ page }: { page: Page }) => {
    // upload a small JSON file
    const filePath = JSON.stringify([{ name: 'Max Mustermann', number: '123' }])
    await page.setInputFiles('#import-file', { name: 'members.json', mimeType: 'application/json', buffer: Buffer.from(filePath) })

    // press import
    await page.click('button:has-text("Start import")')

    // modal should appear
    const dialog = page.locator('role=dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveAttribute('aria-modal', 'true')

    // keyboard: Enter confirms
    await page.keyboard.press('Enter')

    // axe check
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations.length).toBe(0)
  })
})
