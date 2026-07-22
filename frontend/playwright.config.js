import { defineConfig, devices } from '@playwright/test'

// These are production smoke/verification tests: the app's data comes from the
// live API (there is no local DB), so a locally-served frontend cannot render a
// real network. They therefore run against a deployed site by default. Override
// with E2E_BASE_URL to point at a staging deploy.
//
// Run:  npm run e2e            (headless, against E2E_BASE_URL or the live site)
//       npm run e2e:headed     (watch it in a browser)
// Force a trailing slash so relative gotos resolve UNDER the /ignet path
// (new URL('dignet', '.../ignet/') -> '.../ignet/dignet'); without it the last
// path segment is dropped. Specs use leading-slash-free relative paths.
const BASE_URL = (process.env.E2E_BASE_URL || 'https://ignet.org/ignet').replace(/\/+$/, '') + '/'

export default defineConfig({
  testDir: './e2e',
  timeout: 180_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1440, height: 1000 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
