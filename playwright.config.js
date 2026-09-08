// @ts-check
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

/**
 * The BlueBox user-app under test (user-app-bluebox-dev.azurewebsites.net) serves
 * both the logged-out auth UI / public guest pages and the authenticated planner
 * experience. Three projects: a one-time `setup` login, the logged-out `user-app`
 * specs, and the authenticated `user-app-auth` specs (*.auth.spec.js) that reuse
 * the saved storageState.
 *
 * Environment values come from .env (gitignored). See .env.example for the keys.
 */
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // The shared -test backend cold-starts slowly; one retry locally (two on CI)
  // absorbs transient navigation timeouts without masking real failures.
  retries: process.env.CI ? 2 : 1,
  // Cap parallelism — too many concurrent browsers overload the shared Azure app
  // and cause cascading navigation timeouts.
  workers: process.env.CI ? 1 : 3,
  reporter: [['html', { open: 'never' }], ['list']],

  // Test timeout must exceed navigationTimeout so a slow (cold-start) page load
  // can use its full navigation budget instead of being killed by the test clock.
  timeout: 90_000,
  expect: { timeout: 10_000 },

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 60_000,
  },

  projects: [
    // Logs in once and saves storageState to .auth/user.json.
    {
      name: 'setup',
      testDir: './fixtures',
      testMatch: 'auth.setup.js',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.USER_APP_URL,
      },
    },
    // Logged-out specs: auth UI (login) and public guest pages. No stored session.
    {
      name: 'user-app',
      testDir: './tests/user-app',
      testIgnore: '**/*.auth.spec.js',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.USER_APP_URL,
      },
    },
    // Authenticated planner specs (*.auth.spec.js) — reuse the saved session.
    {
      name: 'user-app-auth',
      testDir: './tests/user-app',
      testMatch: '**/*.auth.spec.js',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.USER_APP_URL,
        storageState: '.auth/user.json',
      },
    },
  ],
});
