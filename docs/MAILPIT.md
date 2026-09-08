# Mailpit — email / OTP testing setup

Mailpit is an SMTP sink + web UI + REST API used to capture and assert on the
emails the app sends (signup verification, forgot-password reset link, guest
invites). Docs: https://mailpit.axllent.org/docs/

## Install (macOS)
```bash
brew install mailpit
```
Other platforms: https://mailpit.axllent.org/docs/install/ (binary, Docker, script).

## Run
```bash
mailpit                       # SMTP on :1025, Web UI + REST API on :8025
# or run it as a background service:
brew services start mailpit
```
Open the UI at http://localhost:8025 ; the REST API is under http://localhost:8025/api/v1.

Useful flags (see https://mailpit.axllent.org/docs/configuration/runtime-options/):
- `--smtp 0.0.0.0:1025` / `MP_SMTP_BIND_ADDR` — SMTP bind address
- `--listen 0.0.0.0:8025` / `MP_UI_BIND_ADDR` — Web UI + API bind address
- `--smtp-auth-accept-any` — accept any SMTP credentials (handy for test senders)
- `--ui-auth-file` / `--smtp-auth-file` — enable basic auth (set MAILPIT creds in tests if used)

## Point the app at Mailpit  ← required for capture
Mailpit only receives mail that is **sent to its SMTP port**. The BlueBox backend
must have its SMTP host/port configured to this Mailpit instance's `host:1025`:
- **Local Mailpit** works only if the sender (the app) can reach `localhost:1025`
  — i.e. the app runs locally, or Mailpit is exposed publicly (tunnel) and the
  backend points at it.
- **Hosted `-test` app:** its backend SMTP must point at a network-reachable
  Mailpit. Set `MAILPIT_URL` (in `.env`) to that instance's base URL.

## How the tests use it
`utils/mailpit.js` wraps the REST API (base URL from `MAILPIT_URL`, default
`http://localhost:8025`):
- `waitForMessage({ to, subject })` — poll until the email arrives, return it
- `extractOtp(msg)` / `extractLink(msg, /reset/)` — pull the code / link from the body
- `deleteAll()` — clear the mailbox before a flow
- `isUp()` — skip email-dependent specs cleanly when Mailpit is unreachable

```js
const mailpit = require('../../utils/mailpit');
await mailpit.deleteAll();
// ...trigger forgot-password in the app...
const msg = await mailpit.waitForMessage({ to: EMAIL, subject: 'Reset' });
const link = mailpit.extractLink(msg, /reset|password/);
```

## Config
- `.env` → `MAILPIT_URL=` (base URL of the Mailpit instance the app delivers to)
