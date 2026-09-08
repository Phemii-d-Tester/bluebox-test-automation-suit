const { test, expect } = require('@playwright/test');
const { SignupPage } = require('../../pages/user-app/signup.page');

// NOTE: completing signup (account creation → /verify-email → email code) is gated
// by an invisible reCAPTCHA on the form, which is not automatable (and CAPTCHAs are
// not solved by policy). This spec covers the form, validation, and links; the
// end-to-end account creation needs a reCAPTCHA test key + an automation-grade inbox
// (Mailslurp/Mailosaur) — flagged for the team.
test.describe('Create Account @auth @signup @regression', () => {
  let signup;

  test.beforeEach(async ({ page }) => {
    signup = new SignupPage(page);
    await signup.goto();
  });

  test('should show the Create Account form @smoke', async () => {
    await expect(signup.heading).toBeVisible();
    await expect(signup.fullNameInput).toBeVisible();
    await expect(signup.emailInput).toBeVisible();
    await expect(signup.passwordInput).toBeVisible();
    await expect(signup.createButton).toBeVisible();
  });

  test('should state the password policy', async () => {
    await expect(signup.passwordPolicy).toBeVisible();
  });

  test('should link to Terms and Privacy Policy', async () => {
    await expect(signup.termsLink).toHaveAttribute('href', '/terms');
    await expect(signup.privacyLink).toHaveAttribute('href', '/privacy');
  });

  test('should link back to Sign In', async () => {
    await expect(signup.signInLink).toHaveAttribute('href', '/login');
  });

  test('should accept the account details into the form', async () => {
    await signup.fill({ fullName: 'QA Bluebox', email: 'qa.bluebox@example.com', password: 'Passw0rd!23' });
    await expect(signup.fullNameInput).toHaveValue('QA Bluebox');
    await expect(signup.emailInput).toHaveValue('qa.bluebox@example.com');
  });
});
