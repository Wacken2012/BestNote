import { test, expect } from '@playwright/test'

test('Note list is accessible', async ({ page }) => {
  await page.goto('/notes')
  const list = await page.locator('[role="list"]')
  await expect(list).toHaveCount(1)
  const items = await page.locator('[role="listitem"]')
  await expect(items).toHaveCount(2)
})

test('Note editor is accessible', async ({ page }) => {
  await page.goto('/notes/1')
  await expect(page.locator('form[aria-label="Notizeditor"]')).toBeVisible()
  await expect(page.locator('label[for="title"]')).toBeVisible()
  await expect(page.locator('#title')).toBeVisible()
})
