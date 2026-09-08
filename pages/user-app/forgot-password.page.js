// Page Object for the Forgot Password page (user-app: /forgot-password).
// Verified against the live -test DOM.

class ForgotPasswordPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { level: 1, name: 'Forgot Password?' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.sendButton = page.getByRole('button', { name: 'Send Recovery Code' });
    this.backToSignIn = page.getByRole('link', { name: 'Sign in' });

    // Confirmation screen (after submitting a valid email).
    this.checkEmailHeading = page.getByRole('heading', { name: 'Check your email' });
    this.tryAnotherEmail = page.getByRole('button', { name: 'Try another email' });
    this.backToSignInLink = page.getByRole('link', { name: 'Back to Sign In' });
  }

  async goto() {
    await this.page.goto('/forgot-password', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await this.sendButton.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(500);
  }

  async requestReset(email) {
    await this.emailInput.fill(email);
    await this.sendButton.click();
  }
}

module.exports = { ForgotPasswordPage };
