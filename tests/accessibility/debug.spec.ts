import { test } from '@playwright/test'
import fs from 'fs'

const base = 'http://localhost:5173'

test('debug: capture HTML and screenshots for /setup and /import', async ({ page }) => {
  try { await fs.promises.mkdir('playwright-report', { recursive: true }) } catch (e) {}

  // capture /setup
  try {
    await page.goto(`${base}/setup`, { waitUntil: 'networkidle', timeout: 120000 })
    await page.screenshot({ path: 'playwright-report/debug-setup.png', fullPage: true }).catch(()=>{})
    const html = await page.content().catch(() => '<!-- content read failed -->')
    await fs.promises.writeFile('playwright-report/debug-setup.html', html).catch(()=>{})
  } catch (e) {
    await fs.promises.writeFile('playwright-report/debug-setup.error.txt', String(e)).catch(()=>{})
  }

  // capture /import
  try {
    await page.goto(`${base}/import`, { waitUntil: 'networkidle', timeout: 120000 })
    await page.screenshot({ path: 'playwright-report/debug-import.png', fullPage: true }).catch(()=>{})
    const html2 = await page.content().catch(() => '<!-- content read failed -->')
    await fs.promises.writeFile('playwright-report/debug-import.html', html2).catch(()=>{})
  } catch (e) {
    await fs.promises.writeFile('playwright-report/debug-import.error.txt', String(e)).catch(()=>{})
  }
})
