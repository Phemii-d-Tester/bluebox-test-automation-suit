// Yopmail public-inbox reader (Playwright-driven).
//
// WHY: for a HOSTED app you can't point the backend SMTP at a local sink like
// Mailpit without devops. A public inbox service (yopmail — like Mailslurp/
// Mailosaur) needs zero backend changes: the app already delivers to the real
// address, and we read it. The "config" is just the inbox name in the test.
//
// Any address `<name>@yopmail.com` has a public, readable inbox. The app under
// test signs in as the configured BLUEBOX_EMAIL (a yopmail address) → its mail
// lands in that address's inbox.
const HOME = 'https://yopmail.com/en/';

/** local-part of an @yopmail.com address (the inbox name). */
const inboxName = (email) => String(email).split('@')[0];

async function openInbox(page, email) {
  await page.goto(HOME, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  for (const re of [/^agree/i, /^accept/i, /consent/i, /i agree/i]) {
    const b = page.getByRole('button', { name: re });
    if (await b.count().catch(() => 0)) { await b.first().click().catch(() => {}); break; }
  }
  await page.locator('#login').fill(inboxName(email));
  await page.locator('#login').press('Enter');
  await page.waitForURL(/\/wm/, { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(1500);
}

/**
 * Poll the inbox (refreshing) until a message (optionally matching `subject`)
 * appears, open it, and return { text, hrefs }.
 */
async function waitForMessage(page, email, { subject, timeout = 45_000, interval = 4000 } = {}) {
  await openInbox(page, email);
  const inbox = page.frameLocator('#ifinbox');
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const items = inbox.locator('button.lm, div.m');
    const n = await items.count().catch(() => 0);
    for (let i = 0; i < n; i++) {
      const label = (await items.nth(i).innerText().catch(() => '')) || '';
      if (!subject || new RegExp(subject, 'i').test(label)) {
        await items.nth(i).click().catch(() => {});
        await page.waitForTimeout(1500);
        const mail = page.frameLocator('#ifmail');
        const text = (await mail.locator('body').innerText().catch(() => '')) || '';
        const hrefs = await mail
          .locator('a')
          .evaluateAll((as) => as.map((a) => a.href).filter((h) => /^https?:/.test(h)))
          .catch(() => []);
        return { text, hrefs };
      }
    }
    await page.locator('#refresh').click().catch(() => {});
    await page.waitForTimeout(interval);
  }
  throw new Error(`yopmail: no message${subject ? ` matching "${subject}"` : ''} in "${inboxName(email)}" within ${timeout}ms`);
}

/** Extract an N-digit OTP (default 6) from a message. */
function extractOtp({ text } = {}, digits = 6) {
  const m = String(text || '').match(new RegExp(`\\b(\\d{${digits}})\\b`));
  return m ? m[1] : null;
}

/** Extract the first link (optionally matching `pattern`) — checks hrefs then body text. */
function extractLink({ text, hrefs = [] } = {}, pattern) {
  const all = [...hrefs, ...(String(text || '').match(/https?:\/\/[^\s"'<>)]+/g) || [])];
  return pattern ? all.find((l) => pattern.test(l)) || null : all[0] || null;
}

module.exports = { HOME, inboxName, openInbox, waitForMessage, extractOtp, extractLink };
