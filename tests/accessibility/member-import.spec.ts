import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import fs from 'fs'

const base = 'http://localhost:5173'

// Increase timeout for these slower CI runs
test.setTimeout(120000)

test.describe('MemberImport accessibility', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // ensure app thinks initial setup was completed so /import is directly reachable
    await page.addInitScript(() => { localStorage.setItem('setupCompleted', 'true') })

  // attach console/pageerror handlers and flush logs to disk as they arrive so we have diagnostics
  const logsPath = 'playwright-report/member-import-console.log'
  try { await fs.promises.mkdir('playwright-report', { recursive: true }) } catch (e) {}
  // create an early marker file so CI artifact upload finds at least one file
  try { await fs.promises.writeFile('playwright-report/marker-member-import.txt', `start:${Date.now()}`) } catch (e) {}
  await fs.promises.writeFile(logsPath, `=== Playwright logs for member-import (start) ===\n`).catch(()=>{})
    page.on('console', msg => {
      const line = `[console:${msg.type()}] ${msg.text()}\n`
      fs.appendFile(logsPath, line, () => {})
    })
    page.on('pageerror', err => {
      const line = `[pageerror] ${err?.message || err}\n`
      fs.appendFile(logsPath, line, () => {})
    })

    // navigate and wait for the main import view to render; capture diagnostics on failure
    try {
      await page.goto(`${base}/import`, { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForSelector('main.page.member-import', { timeout: 60000 })
    } catch (err) {
      try { await fs.promises.mkdir('playwright-report', { recursive: true }) } catch (e) {}
      await page.screenshot({ path: 'playwright-report/member-import-before-failure.png', fullPage: true }).catch(()=>{})
      try {
        if (!page.isClosed()) {
          const html = await page.content()
          await fs.promises.writeFile('playwright-report/member-import-before-failure.html', html).catch(()=>{})
        } else {
          await fs.promises.writeFile('playwright-report/member-import-before-failure.html', '<!-- page closed before content could be read -->').catch(()=>{})
        }
      } catch (e) {}
      throw err
    }
  })

  test('upload and preview modal accessibility', async ({ page }: { page: Page }) => {
    // upload a small JSON file
    const filePath = JSON.stringify([{ name: 'Max Mustermann', number: '123' }])
    // be sure the input is present
    await page.waitForSelector('#import-file', { timeout: 60000 })
    try {
      await page.setInputFiles('#import-file', { name: 'members.json', mimeType: 'application/json', buffer: Buffer.from(filePath) })
    } catch (err) {
      // diagnostic: save screenshot and HTML to playwright-report for later triage
      try { await fs.promises.mkdir('playwright-report', { recursive: true }) } catch (e) {}
      await page.screenshot({ path: 'playwright-report/member-import-failure.png', fullPage: true }).catch(()=>{})
      try {
        if (!page.isClosed()) {
          const html = await page.content()
          await fs.promises.writeFile('playwright-report/member-import-failure.html', html).catch(()=>{})
        } else {
          await fs.promises.writeFile('playwright-report/member-import-failure.html', '<!-- page closed before content could be read -->').catch(()=>{})
        }
      } catch (e) {}
      throw err
    }

    // press import
    await page.click('button:has-text("Start import")')

    // modal should appear
    const dialog = page.locator('role=dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveAttribute('aria-modal', 'true')

    // keyboard: Enter confirms
    await page.keyboard.press('Enter')

    // axe check
  const accessibilityScanResults = await new AxeBuilder({ page: page as any }).analyze()
    expect(accessibilityScanResults.violations.length).toBe(0)

    // flush any remaining logs
    try { await fs.promises.appendFile('playwright-report/member-import-console.log', `=== Playwright logs (end) ===\n`).catch(()=>{}) } catch (e) {}
  })
})
