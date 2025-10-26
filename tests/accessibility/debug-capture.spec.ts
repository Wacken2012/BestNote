import { test } from '@playwright/test'
import fs from 'fs'

const base = 'http://localhost:5173'

// Lightweight debug test: capture raw HTML of important pages and write to playwright-report
test('debug: capture raw page HTML for /import and /setup', async ({ page }) => {
  try { await fs.promises.mkdir('playwright-report', { recursive: true }) } catch (e) {}

  // capture /import
  try {
    await page.goto(`${base}/import`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    const html = await page.content().catch(() => '<!-- content read failed -->')
    await fs.promises.writeFile('playwright-report/debug-import.html', html).catch(()=>{})
  } catch (e) {
    await fs.promises.writeFile('playwright-report/debug-import.error.txt', String(e)).catch(()=>{})
  }

  // capture /setup
  try {
    await page.goto(`${base}/setup`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    const html2 = await page.content().catch(() => '<!-- content read failed -->')
    await fs.promises.writeFile('playwright-report/debug-setup.html', html2).catch(()=>{})
  } catch (e) {
    await fs.promises.writeFile('playwright-report/debug-setup.error.txt', String(e)).catch(()=>{})
  }
})
