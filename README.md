# BlueBox — Test Automation Suite (Playwright)

End‑to‑end functional regression suite for **BlueBox**, an event‑management SaaS.
Built with **Playwright** (JavaScript) using the **Page Object Model**, targeting the
`user-app` test environment.

> **Phase 1** covers Authentication, Dashboard, Event creation (guests, seating,
> activation) and Guest RSVP. Phase‑2 flows (menu/food, single‑event view, edit event,
> guest groups, check‑in kiosk, etc.) are parked under [`archive/`](archive/) and are
> not run by the suite.

---

## Tech stack
- [Playwright Test](https://playwright.dev/) (`@playwright/test`)
- JavaScript (CommonJS), Node 20+
- Page Object Model (`pages/`) + reusable helpers (`utils/`) + fixtures/data
- Email/OTP capture via **Mailpit** (self‑hosted) or a public inbox reader
- CI via **GitHub Actions**

## Repository structure
```
tests/user-app/        # specs (one per flow)
pages/user-app/        # Page Objects (locators + actions, no assertions)
fixtures/              # auth.setup.js (storageState) + data/ (e.g. CSV import)
data/                  # static test data (fixtures, dietary tags, event fixtures)
utils/                 # dates, generators, mailpit + yopmail readers, event factory
elements/              # human-readable element references per flow (01..06)
docs/                  # PHASE-1-REPORT, MAILPIT + MAILPIT-DEVOPS setup notes
Best Practices/        # authoring guidelines
archive/               # Phase-2 specs & POMs (not executed)
playwright.config.js   # projects: setup, user-app, user-app-auth
.github/workflows/     # CI pipeline
```

## Prerequisites
- Node.js 20+
- Then install dependencies and the browser:
```bash
npm ci
npx playwright install chromium
```

## Configuration
Secrets are **never** committed. Copy the template and fill in locally:
```bash
cp .env.example .env
```
`.env` keys:

| Key | Purpose |
|---|---|
| `USER_APP_URL` | Base URL of the user-app under test |
| `BLUEBOX_EMAIL` | Planner/host sign-in email |
| `BLUEBOX_PASSWORD` | Planner/host sign-in password |
| `MAILPIT_URL` | Base URL of the Mailpit instance the app delivers to (email tests) |

`.env`, `.auth/`, `node_modules/`, and all test artifacts are git‑ignored.

## Running the tests
```bash
npm test              # default regression (excludes @publish and @email)
npm run test:smoke    # @smoke subset
npm run test:auth     # authenticated specs only
npm run test:user     # logged-out specs only
npm run test:publish  # DESTRUCTIVE flows (create event, add guest, RSVP, seating) — on demand
npm run test:email    # email/OTP flows (needs Mailpit wired)
npm run report        # open the last HTML report
```

Run a specific spec / test:
```bash
npx playwright test tests/user-app/dashboard.auth.spec.js
npx playwright test -g "should auto-assign"
npx playwright test tests/user-app/seat-setup-advanced.auth.spec.js:17
npx playwright test tests/user-app/login.spec.js --headed   # or --debug
```
Authenticated specs need the `user-app-auth` project (it runs the login `setup` first):
```bash
npx playwright test --project=user-app-auth tests/user-app/seat-setup.auth.spec.js
```

## Test tags
| Tag | Meaning |
|---|---|
| `@smoke` | Critical-path checks |
| `@regression` | Full regression |
| `@publish` | **Destructive** — persists data (create/add/assign/RSVP). Excluded by default. |
| `@email` | Needs an email inbox (Mailpit). Excluded by default. |
| module tags | `@auth`, `@dashboard`, `@create-event`, `@guests`, `@seat-setup`, `@activate`, `@rsvp` |

## Email / OTP testing
Signup verification and password reset are email‑driven. See:
- [`docs/MAILPIT.md`](docs/MAILPIT.md) — install & run Mailpit, and how the suite reads it.
- [`docs/MAILPIT-DEVOPS.md`](docs/MAILPIT-DEVOPS.md) — what DevOps must configure so the
  hosted `-test` backend delivers mail to Mailpit (needed for `@email` tests to pass).

## Continuous Integration
[`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs the default
regression on push/PR to `main` (and manual dispatch). Configure these **repository
secrets** (Settings → Secrets and variables → Actions):
`USER_APP_URL`, `BLUEBOX_EMAIL`, `BLUEBOX_PASSWORD`, `MAILPIT_URL`.
The HTML report is uploaded as a build artifact.

## Known limitations (documented, tracked as `test.fixme`)
- **CSV guest import** — works manually, but the drop‑zone widget accepts no Playwright
  upload path (it reads via `webkitGetAsEntry`); the import **dialog** is covered. Fix:
  an import API endpoint.
- **Manual drag‑assign** in the floor plan — no accessible seat/table drop target
  (@dnd‑kit pixel‑drag only). **Auto‑Assign** is covered.
- **Signup end‑to‑end** — an invisible reCAPTCHA blocks headless account creation; the
  form and validation are covered.
- **Email flows** (`@email`) run once the backend is wired to Mailpit.

See [`docs/PHASE-1-REPORT.md`](docs/PHASE-1-REPORT.md) for the full results and rationale.

## Conventions
- Page Objects hold locators + actions only; **assertions live in specs**.
- Prefer role/label locators (`getByRole` > `getByPlaceholder` > `getByText`).
- No secrets or real credentials in code — everything sensitive comes from `.env`.
