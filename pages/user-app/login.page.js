// Page Object for the Sign In page (user-app: /login).
// Locators + actions only — NO assertions (those live in specs).
// Verified against the live -test DOM via Playwright ARIA snapshot.

class LoginPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { level: 1, name: 'Sign In' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.showPasswordButton = page.getByRole('button', { name: 'Show password' });
    this.rememberMe = page.getByRole('checkbox', { name: 'Remember me' });
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.googleButton = page.getByRole('button', { name: /Continue with Google/ });
    this.forgotLink = page.getByRole('link', { name: 'Forgot Password?' });
    this.signUpLink = page.getByRole('link', { name: 'Sign Up' });

    // Error / toast surface for invalid credentials.
    this.errorAlert = page.getByRole('alert');
  }

  async goto() {
    // Hydrate before interacting — an un-hydrated form submits credentials as a
    // GET in the URL. domcontentloaded + capped networkidle (full 'load' can hang
    // on a trailing resource during Azure cold-starts).
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await this.signInButton.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(800); // settle so React hydrates before we interact
  }

  async fillEmail(email) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password) {
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.signInButton.click();
  }

  /** Fill both fields and submit. Guards against the un-hydrated native GET submit. */
  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
    // Two cold-start races are possible on this Azure app:
    //  (a) native GET submit before hydration → URL becomes /login?email=…&password=…
    //  (b) the click lands before the submit handler is wired → a silent no-op that
    //      leaves us on a bare /login with no redirect and no error alert.
    // Settle, then if we're still on /login (either case) and there's no auth error
    // shown, re-hydrate and submit once more. A genuine bad-credential response shows
    // the error alert and is left untouched for the spec to assert on.
    await this.page.waitForTimeout(1200);
    const stuckOnLogin = /\/login(\?|$)/.test(this.page.url());
    const hasError = (await this.errorAlert.count()) > 0;
    if (stuckOnLogin && !hasError) {
      await this.goto();
      await this.emailInput.fill(email);
      await this.passwordInput.fill(password);
      await this.signInButton.click();
    }
  }

  /** Full sign-in that waits for the dashboard. */
  async signInAndWait(email, password) {
    await this.goto();
    await this.login(email, password);
    await this.page.waitForURL((u) => u.pathname.includes('/home'), { timeout: 30_000 });
  }
}

module.exports = { LoginPage };
