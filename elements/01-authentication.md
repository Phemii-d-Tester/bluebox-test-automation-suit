# Authentication — element reference (bluebox-test)

Verified against `https://user-app-bluebox-test.azurewebsites.net` via Playwright ARIA snapshots.
Locator strategy per kickoff best practices: `getByRole` > `getByPlaceholder` > `getByText`.
API base for auth: `https://api-bluebox-test.azurewebsites.net/api/v1/auths/*`.

> **Hydration note (critical):** the auth SPA must finish hydrating before interacting,
> otherwise the native form submits credentials as a GET in the URL. Navigate with
> `domcontentloaded` then wait for `networkidle` (or the submit button) before filling.

## Sign In — `/login` (root `/` redirects here as `/login?next=/home`)
| Element | Locator |
|---|---|
| Heading | `getByRole('heading', { level: 1, name: 'Sign In' })` |
| Email | `getByRole('textbox', { name: 'Email' })` — placeholder `you@example.com` |
| Password | `getByRole('textbox', { name: 'Password' })` — placeholder `Min. 8 characters` |
| Show password | `getByRole('button', { name: 'Show password' })` |
| Remember me | `getByRole('checkbox', { name: 'Remember me' })` (checked by default) |
| Forgot Password? | `getByRole('link', { name: 'Forgot Password?' })` → `/forgot-password` |
| Submit | `getByRole('button', { name: 'Sign In' })` |
| Sign Up link | `getByRole('link', { name: 'Sign Up' })` → `/signup` |
| Google | `getByRole('button', { name: /Continue with Google/ })` |

Successful sign in → lands on `/home` directly (no OTP; the old `/staff` redirect is fixed).

## Create Account — `/signup`
| Element | Locator |
|---|---|
| Heading | `getByRole('heading', { level: 1, name: 'Create Account' })` |
| Full Name | `getByRole('textbox', { name: 'Full Name' })` — placeholder `Your full name` |
| Email | `getByRole('textbox', { name: 'Email' })` |
| Password | `getByRole('textbox', { name: 'Password' })` |
| Password policy text | `getByText('Must have at least one uppercase, lowercase, number and symbol')` |
| Submit | `getByRole('button', { name: 'Create Account' })` |
| Terms / Privacy | `getByRole('link', { name: 'Terms' })` → `/terms`, `getByRole('link', { name: 'Privacy Policy' })` → `/privacy` |
| Sign In link | `getByRole('link', { name: 'Sign In' })` → `/login` |

> Post-submit email verification flow: **PENDING Mailpit endpoint** (see README / .env MAILPIT_URL).

## Forgot Password — `/forgot-password`
| Element | Locator |
|---|---|
| Heading | `getByRole('heading', { level: 1, name: 'Forgot Password?' })` |
| Email | `getByRole('textbox', { name: 'Email' })` |
| Submit | `getByRole('button', { name: 'Send Recovery Code' })` |
| Back to Sign In | `getByRole('link', { name: 'Sign in' })` → `/login` |

Submit → `POST /api/v1/auths/forgot-password` → confirmation screen:
- `getByRole('heading', { name: 'Check your email' })`
- Body: "If an account exists for …, we sent a **link** to reset your password."
- `getByRole('button', { name: 'Try another email' })`, `getByRole('link', { name: 'Back to Sign In' })`

> Reset is completed by opening the emailed **link** → **needs Mailpit** to retrieve it.
