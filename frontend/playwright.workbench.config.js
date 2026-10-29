import { defineConfig, devices } from '@playwright/test'

// Isolated, API-mocked journeys. Playwright owns and cleans up the Vite process.
export default defineConfig({
  testDir: './e2e-workbench',
  timeout: 45000,
  expect: { timeout: 10000 },
  workers: 1,
  reporter: 'list',
  outputDir: '/tmp/ignet-workbench-browser-results',
  use: {
    baseURL: 'http://127.0.0.1:5198/ignet/',
    ...devices['Desktop Chrome'],
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5198 --strictPort',
    url: 'http://127.0.0.1:5198/ignet/',
    reuseExistingServer: false,
    timeout: 60000,
  },
})
