# BlueBox E2E — Phase 1 re-automation report (`-test` env)

Target: `https://user-app-bluebox-test.azurewebsites.net` · Account: a planner test account (configured via `.env`, not committed)
Framework: Playwright (JavaScript, Page Object Model), per the kickoff best practices.

## Scope (Phase 1)
Authentication (Sign in / Sign up / Forgot password) · Dashboard stats · Event creation
(add guest, import guest, floor plan & seat setup, activate/deactivate) · Guest RSVP.
**Kiosk / guest check-in → Phase 2.** All other flows archived to `archive/`.

## Specs (Phase 1)
| Area | Spec | Notes |
|---|---|---|
| Sign In | `login.spec.js` | lands on `/home` (old `/staff` bug fixed) |
| Sign Up | `signup.spec.js` | form + validation; account creation blocked by reCAPTCHA |
| Forgot Password | `forgot-password.spec.js` | form + confirmation; reset email via `@email` |
| Dashboard | `dashboard.auth.spec.js` | Total Events / Total Guests / Avg. Attendance / Upcoming |
| Create Event | `create-event.auth.spec.js` | single-page form; `Location` required; real create `@publish` |
| Guest management | `guest-management.auth.spec.js` | toolbar, Add-guest dialog, Import dialog; add `@publish`; CSV import `fixme` |
| Seat Setup | `seat-setup.auth.spec.js` | floor-plan editor toolbar + panels |
| Seat Setup (advanced) | `seat-setup-advanced.auth.spec.js` | stage/restroom + **position-conflict** rule, **zone title uniqueness**, **table shape** (validated via create request), **auto-assign** |
| Activate/Deactivate | `activate-deactivate.auth.spec.js` | toggle (Deactivate / Re-activate / Go public) |
| Guest RSVP | `guest-rsvp.spec.js` | `/join/<token>` landing + form + submit `@publish` |

Dashboard coverage also includes a **data-accuracy** suite: the 4 stat cards are asserted
against the authoritative `/api/v1/dashboard` payload; Total Events == `eventsMeta.total`;
Avg. Attendance == `floor(totalGuests/totalEvents)`; Your Events limited to 3 with View All
→ full list; Recent Activity reflects the activity log. Seat-setup manual drag-assign is a
documented `fixme` (no accessible seat/table drop target; @dnd-kit pixel-drag only).

Run: `npm test` (excludes `@publish` + `@email`) · `npm run test:publish` · `npm run test:email`.
Elements reference: `elements/01..06`.

## Known blockers / follow-ups (NOT masked)
1. **CSV guest import** — works manually, but the react-dropzone widget rejects every
   Playwright upload path (setInputFiles / filechooser / DataTransfer drop; it reads via
   `webkitGetAsEntry`). Actual import left as `test.fixme`; dialog is covered. **Fix: import
   via the app API** (endpoint TBC). Also: "Download CSV template" returns an `.xlsx`
   despite the `.csv` filename.
2. **Signup end-to-end** — invisible reCAPTCHA blocks headless account creation. Needs a
   reCAPTCHA **test key** on `-test` (keys in `docs/MAILPIT-DEVOPS.md`).
3. **Email/OTP** — yopmail (public inbox) has its own CAPTCHA → not automation-grade. Wire
   the `-test` backend SMTP to a hosted **Mailpit** (hand-off: `docs/MAILPIT-DEVOPS.md`);
   `utils/mailpit.js` is ready. Email tests tagged `@email`.
4. **Environment** — the `-test` app is intermittently very slow (cold starts >60s). Workers
   capped at 3; login/setup navigate to `/home` directly if the redirect lags.

## Results (2026-08)
- **`npm test` (default, excludes `@publish` + `@email`): 34 passed, 0 failed** — 10 spec files.
- **`@publish` (destructive, on-demand): 4 passed** — real create-event, add-guest, guest RSVP (two-step confirm), activate/deactivate toggle.
- **`@email` (1): pending** — forgot-password reset email; runs once Mailpit is wired (or yopmail w/o CAPTCHA).
- **`fixme` (1): CSV import action** — see blocker #1.

Total: 40 tests / 10 files. Suite is green; the two open items (CSV import, email) are the documented blockers above, awaiting the API import path and the Mailpit/reCAPTCHA DevOps items.
