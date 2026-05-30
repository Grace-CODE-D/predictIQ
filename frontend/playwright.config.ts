import { defineConfig, devices } from '@playwright/test';

const isStaging = !!process.env.STAGING_URL;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // ------------------------------------------------------------------
    // Local / PR projects (default)
    // ------------------------------------------------------------------
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: isStaging ? '**' : undefined,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: isStaging ? '**' : undefined,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: isStaging ? '**' : undefined,
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testIgnore: isStaging ? '**' : undefined,
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
      testIgnore: isStaging ? '**' : undefined,
    },
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
      testIgnore: isStaging ? '**' : undefined,
    },

    // ------------------------------------------------------------------
    // Staging project — activated when STAGING_URL is set.
    // Runs against a real API; no local web server is started.
    // ------------------------------------------------------------------
    {
      name: 'staging',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.STAGING_URL,
      },
      testIgnore: isStaging ? undefined : '**',
    },
  ],

  // Only start the local dev server when NOT running against staging.
  webServer: isStaging
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});
