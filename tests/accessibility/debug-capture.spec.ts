import { test } from '@playwright/test'
import fs from 'fs'
import AxeBuilder from '@axe-core/playwright'

const base = 'http://localhost:5173'

// Lightweight debug test: capture raw HTML of important pages and write to playwright-report
// Also run a lightweight axe analysis for /import and /setup to guarantee axe-results JSONs
test('debug: capture raw page HTML for /import and /setup', async ({ page }) => {
  try { await fs.promises.mkdir('playwright-report', { recursive: true }) } catch (e) {}

  // capture /import and run axe
  try {
    await page.goto(`${base}/import`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    const html = await page.content().catch(() => '<!-- content read failed -->')
    await fs.promises.writeFile('playwright-report/debug-import.html', html).catch(()=>{})
    try {
      const results = await new AxeBuilder({ page: page as any }).analyze()
      await fs.promises.writeFile('playwright-report/axe-results-member-import.json', JSON.stringify(results, null, 2)).catch(()=>{})
      try { const info = test.info(); await info.attach('axe-results-member-import.json', { body: Buffer.from(JSON.stringify(results)), contentType: 'application/json' }) } catch(e) {}
    } catch (e) {
      await fs.promises.writeFile('playwright-report/axe-results-member-import.json', JSON.stringify({ error: String(e) }, null, 2)).catch(()=>{})
    }
  } catch (e) {
    await fs.promises.writeFile('playwright-report/debug-import.error.txt', String(e)).catch(()=>{})
  }

  // capture /setup and run axe
  try {
    await page.goto(`${base}/setup`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    const html2 = await page.content().catch(() => '<!-- content read failed -->')
    await fs.promises.writeFile('playwright-report/debug-setup.html', html2).catch(()=>{})
    try {
      const results2 = await new AxeBuilder({ page: page as any }).analyze()
      await fs.promises.writeFile('playwright-report/axe-results-setup.json', JSON.stringify(results2, null, 2)).catch(()=>{})
      try { const info = test.info(); await info.attach('axe-results-setup.json', { body: Buffer.from(JSON.stringify(results2)), contentType: 'application/json' }) } catch(e) {}
    } catch (e) {
      await fs.promises.writeFile('playwright-report/axe-results-setup.json', JSON.stringify({ error: String(e) }, null, 2)).catch(()=>{})
    }
  } catch (e) {
    await fs.promises.writeFile('playwright-report/debug-setup.error.txt', String(e)).catch(()=>{})
  }
})
