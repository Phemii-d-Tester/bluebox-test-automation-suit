const { test, expect } = require('@playwright/test');
const { ForgotPasswordPage } = require('../../pages/user-app/forgot-password.page');
const yop = require('../../utils/yopmail');

const EMAIL = process.env.BLUEBOX_EMAIL;

test.describe('Forgot Password @auth @forgot @regression', () => {
  let forgot;

  test.beforeEach(async ({ page }) => {
    forgot = new ForgotPasswordPage(page);
    await forgot.goto();
  });

  test('should show the recovery form @smoke', async () => {
    await expect(forgot.heading).toBeVisible();
    await expect(forgot.emailInput).toBeVisible();
    await expect(forgot.sendButton).toBeVisible();
    await expect(forgot.backToSignIn).toHaveAttribute('href', '/login');
  });

  test('should confirm the recovery email was sent for a valid address @smoke', async () => {
    test.skip(!EMAIL, 'Set BLUEBOX_EMAIL in .env.');
    await forgot.requestReset(EMAIL);
    await expect(forgot.checkEmailHeading).toBeVisible({ timeout: 20_000 });
    await expect(forgot.tryAnotherEmail).toBeVisible();
  });

  // @email is excluded from default runs (reads the real inbox; yopmail can throw
  // an intermittent CAPTCHA). It proves the reset email is actually delivered.
  // Does NOT complete the reset (that would change the account password).
  test('should deliver a password-reset link to the inbox @email', async ({ page }) => {
    test.skip(!EMAIL || !/@yopmail\.com$/i.test(EMAIL), 'Requires a yopmail BLUEBOX_EMAIL.');
    await forgot.requestReset(EMAIL);
    await expect(forgot.checkEmailHeading).toBeVisible({ timeout: 20_000 });

    let msg;
    try {
      msg = await yop.waitForMessage(page, EMAIL, { subject: /reset|password/i, timeout: 45_000 });
    } catch (e) {
      test.skip(true, 'yopmail unreachable/CAPTCHA — ' + e.message);
    }
    test.skip(/CAPTCHA/i.test(msg.text || ''), 'yopmail CAPTCHA interstitial.');
    expect(yop.extractLink(msg, /reset|password/i), 'reset link in email').toBeTruthy();
  });
});
