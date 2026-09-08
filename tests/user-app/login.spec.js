const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/user-app/login.page');

const EMAIL = process.env.BLUEBOX_EMAIL;
const PASSWORD = process.env.BLUEBOX_PASSWORD;

test.describe('Sign In @auth @login @regression', () => {
  let login;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    await login.goto();
  });

  test.describe('UI presence', () => {
    test('should show the Sign In form with email, password and CTA @smoke', async () => {
      await expect(login.heading).toBeVisible();
      await expect(login.emailInput).toBeVisible();
      await expect(login.passwordInput).toBeVisible();
      await expect(login.signInButton).toBeVisible();
      await expect(login.rememberMe).toBeVisible();
    });

    test('should link to Forgot Password and Sign Up', async () => {
      await expect(login.forgotLink).toHaveAttribute('href', '/forgot-password');
      await expect(login.signUpLink).toHaveAttribute('href', '/signup');
    });

    test('should offer "Continue with Google"', async () => {
      await expect(login.googleButton).toBeVisible();
    });
  });

  test.describe('Validation', () => {
    test('should not sign in with empty fields', async ({ page }) => {
      await login.submit();
      await expect(page).toHaveURL(/\/login/);
    });

    test('should show an error for incorrect credentials', async ({ page }) => {
      await login.login('no-such-user@example.com', 'WrongPassword123!');
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByRole('alert').first()).toBeVisible();
    });
  });

  test.describe('Authentication', () => {
    test('should sign in and land on the dashboard @smoke', async ({ page }) => {
      test.skip(!EMAIL || !PASSWORD, 'Set BLUEBOX_EMAIL/BLUEBOX_PASSWORD in .env.');
      await login.login(EMAIL, PASSWORD);
      await page.waitForURL((u) => u.pathname.includes('/home'), { timeout: 30_000 });
      await expect(page.getByRole('heading', { level: 1, name: /^Welcome,/ })).toBeVisible();
    });
  });
});
