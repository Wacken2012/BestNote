import { test, expect } from '@playwright/test'

test('SetupWizard demo mode activates demo data', async ({ page }) => {
  await page.goto('/setup')
  await page.fill('#orgName', 'Musikverein Alsdorf')
  await page.selectOption('#language', 'de')
  await page.check('input[type="checkbox"]')
  await page.click('button[type="submit"]')

  await expect(page.locator('h1')).toContainText('Musikverein Alsdorf')
  await expect(page.locator('[role="listitem"]')).toContainText('Dirigent')
})
