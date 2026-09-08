// Page Object for the Create Account page (user-app: /signup).
// Verified against the live -test DOM.

class SignupPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { level: 1, name: 'Create Account' });
    this.subtitle = page.getByText('Create a free account to setup your first event.');
    this.fullNameInput = page.getByRole('textbox', { name: 'Full Name' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.passwordPolicy = page.getByText('Must have at least one uppercase, lowercase, number and symbol');
    this.createButton = page.getByRole('button', { name: /Create Account|Creating account/ });
    this.termsLink = page.getByRole('link', { name: 'Terms' });
    this.privacyLink = page.getByRole('link', { name: 'Privacy Policy' });
    this.signInLink = page.getByRole('link', { name: 'Sign In' });
    this.googleButton = page.getByRole('button', { name: /Continue with Google/ });
    this.errorAlert = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/signup', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await this.createButton.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(600);
  }

  async fill({ fullName, email, password } = {}) {
    if (fullName !== undefined) await this.fullNameInput.fill(fullName);
    if (email !== undefined) await this.emailInput.fill(email);
    if (password !== undefined) await this.passwordInput.fill(password);
  }

  async submit() {
    await this.createButton.click();
  }
}

module.exports = { SignupPage };
