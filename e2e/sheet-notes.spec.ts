import { test, expect } from '@playwright/test'

test('Sheet note creation and display', async ({ page }) => {
  await page.goto('/sheets/1')
  await page.fill('#content', 'Dies ist eine Testnotiz für Sheet 1')
  await page.click('button[type="submit"]')
  await expect(page.locator('[role="listitem"]')).toContainText('Dies ist eine Testnotiz')
})
