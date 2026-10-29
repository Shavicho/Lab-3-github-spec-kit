import { defineConfig, devices } from '@playwright/test';

const localServer = {
  command: 'npm run dev -- --host 127.0.0.1',
  url: 'http://127.0.0.1:5173',
  reuseExistingServer: !process.env.CI,
  timeout: 30_000,
};

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      testMatch: 'e2e/**/*.spec.js',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testMatch: 'e2e/**/*.spec.js',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'edge',
      testMatch: 'e2e/**/*.spec.js',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'performance',
      testMatch: 'performance/**/*.spec.js',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: localServer,
});
