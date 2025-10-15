import { test, expect } from '@playwright/test';

test('Dashboard-Komponente wird angezeigt', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  // Prüfe, ob ein <h2> existiert
  const h2 = page.locator('h2');
  await expect(h2).toHaveCount(1);
  await expect(h2).toContainText('Dashboard');
});
