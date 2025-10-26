import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import fs from 'fs'

const base = 'http://localhost:5173'

test.describe('MemberImport accessibility', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // ensure app thinks initial setup was completed so /import is directly reachable
    await page.addInitScript(() => { localStorage.setItem('setupCompleted', 'true') })
    await page.goto(`${base}/import`)
    // wait for the main import view to render; capture diagnostics on failure
    try {
      await page.waitForSelector('main.page.member-import', { timeout: 60000 })
    } catch (err) {
      try { await fs.promises.mkdir('playwright-report', { recursive: true }) } catch (e) {}
      await page.screenshot({ path: 'playwright-report/member-import-before-failure.png', fullPage: true }).catch(()=>{})
      await fs.promises.writeFile('playwright-report/member-import-before-failure.html', await page.content()).catch(()=>{})
      throw err
    }
  })

  test('upload and preview modal accessibility', async ({ page }: { page: Page }) => {
    // upload a small JSON file
    const filePath = JSON.stringify([{ name: 'Max Mustermann', number: '123' }])
  await page.waitForSelector('#import-file', { timeout: 60000 })
    try {
      await page.setInputFiles('#import-file', { name: 'members.json', mimeType: 'application/json', buffer: Buffer.from(filePath) })
    } catch (err) {
      // diagnostic: save screenshot and HTML to playwright-report for later triage
      try { await fs.promises.mkdir('playwright-report', { recursive: true }) } catch (e) {}
      await page.screenshot({ path: 'playwright-report/member-import-failure.png', fullPage: true }).catch(()=>{})
      await fs.promises.writeFile('playwright-report/member-import-failure.html', await page.content()).catch(()=>{})
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
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations.length).toBe(0)
  })
})
