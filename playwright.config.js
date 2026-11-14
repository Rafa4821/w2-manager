import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 15000,
  retries: 1,
  workers: 1,
  use: {
    baseURL: 'http://localhost:4179',
    headless: true,
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npx vite --port 4179 --strictPort',
    port: 4179,
    reuseExistingServer: true,
    timeout: 20000,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
})
