import { test, expect } from '@playwright/test';

test('Navigation über Menü funktioniert', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  // Dashboard sollte sichtbar sein
    await page.waitForSelector('h2');
    await expect(page.locator('h2')).toContainText('BestNote Dashboard');

  // Navigiere zu Import
  await page.click('text=Import');
  await page.waitForSelector('h2');
  await expect(page.locator('h2')).toContainText('Import');

  // Navigiere zu Export
  await page.click('text=Export');
  await page.waitForSelector('h2');
  await expect(page.locator('h2')).toContainText('Export');

  // Navigiere zu Kalender
  await page.click('text=Kalender');
  await page.waitForSelector('h2');
  await expect(page.locator('h2')).toContainText('Kalender');
});

test('Navigation über Dashboard-Kacheln funktioniert', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Kachel Import
  await page.click('text=Import');
  await page.waitForSelector('h2');
  await expect(page.locator('h2')).toContainText('Import');
  await page.goBack();

  // Kachel Export
  await page.click('text=Export');
  await page.waitForSelector('h2');
  await expect(page.locator('h2')).toContainText('Export');
  await page.goBack();

  // Kachel Kalender
  await page.click('text=Kalender');
  await page.waitForSelector('h2');
  await expect(page.locator('h2')).toContainText('Kalender');
});
