# Mailpit for the `-test` environment — DevOps hand-off

Goal: capture every email the BlueBox `-test` backend sends (signup verification,
forgot-password reset, guest invites) in a **Mailpit** instance the automated tests
can read via its HTTP API. This removes the yopmail CAPTCHA problem and needs no
per-test setup.

**Why this needs DevOps:** Mailpit is an SMTP *sink* — it only captures mail that is
delivered to its SMTP port. It has no public domain/MX, so the only way the hosted
backend's mail reaches it is to point the backend's **outbound SMTP** at Mailpit.

---

## Recommended: host Mailpit in the test environment

1. **Run Mailpit** somewhere the `-test` backend can reach (same VNet / cluster, or a
   small container with a URL). Docker:
   ```bash
   docker run -d --name mailpit -p 1025:1025 -p 8025:8025 \
     -e MP_SMTP_AUTH_ACCEPT_ANY=true -e MP_SMTP_AUTH_ALLOW_INSECURE=true \
     axllent/mailpit
   ```
   - `1025` = SMTP (where the backend delivers)
   - `8025` = Web UI + REST API (where the tests read)

2. **Point the `-test` backend's SMTP at it.** Set the mail/SMTP env vars of the
   `-test` app (exact names depend on the mailer lib) to:
   | Setting | Value |
   |---|---|
   | SMTP host | the Mailpit host (e.g. `mailpit` service name / internal DNS / IP) |
   | SMTP port | `1025` |
   | TLS / SSL | off (or STARTTLS if you configure certs) |
   | SMTP username / password | blank / any (Mailpit accepts any with the flags above) |
   | From address | anything, e.g. `no-reply@bluebox.test` |

3. **Expose the API (`:8025`) to the test runner** — a URL the CI/dev machine can reach.
   Optional basic auth via `--ui-auth-file` (`MP_UI_AUTH_FILE`); if enabled, share the
   credentials.

## What to hand back to me
- The Mailpit **API base URL**, e.g. `https://mailpit-bluebox-test.<host>` (port 8025 or
  proxied). I set it as `MAILPIT_URL` in `.env`; the suite already reads Mailpit via
  `utils/mailpit.js`.
- Basic-auth credentials, **if** you enable UI/API auth.
- Confirmation the backend SMTP now points at Mailpit (a test signup/forgot should then
  appear in the Mailpit UI).

## Alternative (no hosting): tunnel my local Mailpit
If you'd rather not host it, I can run Mailpit locally and expose its SMTP `:1025` via a
public TCP tunnel (e.g. `ngrok tcp 1025`); you point the backend SMTP at that tunnel
host:port. Works, but the tunnel + my machine must stay up — not ideal for CI/shared use.

## Also needed for automated **signup** (separate from email)
The signup form has an (invisible) **reCAPTCHA**. To automate account creation in `-test`,
please set Google's **reCAPTCHA test keys** for the `-test` env (site key
`6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`, secret
`6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`) which always pass — otherwise signup can't be
driven headlessly (and CAPTCHAs aren't solved by the automation). Forgot-password has no
CAPTCHA, so its email flow works as soon as Mailpit is wired.
