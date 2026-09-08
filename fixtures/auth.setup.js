// Auth setup project — signs in once via the real login UI and saves the
// authenticated session to .auth/user.json. Authenticated specs (*.auth.spec.js)
// reuse this storageState so they don't repeat login.
const fs = require('fs');
const { test: setup, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/user-app/login.page');

const authFile = '.auth/user.json';

setup('authenticate planner', async ({ page }) => {
  const email = process.env.BLUEBOX_EMAIL;
  const password = process.env.BLUEBOX_PASSWORD;
  expect(email, 'BLUEBOX_EMAIL must be set in .env').toBeTruthy();
  expect(password, 'BLUEBOX_PASSWORD must be set in .env').toBeTruthy();

  const login = new LoginPage(page);
  await login.goto();
  await login.login(email, password);

  // The auth cookie is set once the login POST succeeds; the client-side redirect
  // to /home can be slow on cold starts, so navigate there directly if it lags.
  await page.waitForURL((url) => url.pathname.includes('/home'), { timeout: 20_000 }).catch(() => {});
  if (!page.url().includes('/home')) {
    await page.goto('/home', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  }
  await expect(page.getByRole('heading', { level: 1, name: /^Welcome,/ })).toBeVisible({ timeout: 30_000 });

  fs.mkdirSync('.auth', { recursive: true });
  await page.context().storageState({ path: authFile });
});
