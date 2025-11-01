import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/accessibility',
  timeout: 30_000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  webServer: {
    command: 'npm run dev -- --port 5173',
    port: 5173,
    timeout: 120 * 1000,
    reuseExistingServer: true,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
})
