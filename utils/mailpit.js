// Mailpit REST API client for email/OTP testing.
// Docs: https://mailpit.axllent.org/docs/api-v1/  (SMTP :1025, Web UI + API :8025)
//
// Point MAILPIT_URL (.env) at the Mailpit instance the app-under-test delivers to.
// The app's backend SMTP must be configured to send to that Mailpit's :1025 for
// its mail to appear here.
const BASE = (process.env.MAILPIT_URL || 'http://localhost:8025').replace(/\/$/, '');

async function api(path, opts = {}) {
  const res = await fetch(`${BASE}/api/v1${path}`, opts);
  if (!res.ok) throw new Error(`Mailpit ${opts.method || 'GET'} ${path} -> ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

/** List stored messages (newest first). */
const listMessages = (limit = 50) => api(`/messages?limit=${limit}`);

/** Search messages, e.g. search('to:foo@bar.com subject:"Reset"'). */
const search = (query, limit = 50) => api(`/search?query=${encodeURIComponent(query)}&limit=${limit}`);

/** Full message incl. Text + HTML bodies. */
const getMessage = (id) => api(`/message/${id}`);

/** Delete all stored messages (clean slate before a flow). */
const deleteAll = () =>
  api('/messages', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => {});

/** Is the Mailpit instance reachable? */
async function isUp() {
  try {
    await api('/messages?limit=1');
    return true;
  } catch {
    return false;
  }
}

/**
 * Poll until a message to `to` (optionally matching `subject`) arrives, then
 * return its full content. Newest match wins.
 */
async function waitForMessage({ to, subject, timeout = 30_000, interval = 1500 } = {}) {
  const q = [to && `to:${to}`, subject && `subject:${JSON.stringify(subject)}`].filter(Boolean).join(' ');
  const deadline = Date.now() + timeout;
  let lastErr;
  while (Date.now() < deadline) {
    try {
      const data = q ? await search(q) : await listMessages();
      const first = (data.messages || [])[0];
      if (first) return getMessage(first.ID);
    } catch (e) {
      lastErr = e;
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error(`Mailpit: no message (to:${to} subject:${subject}) within ${timeout}ms${lastErr ? ' — ' + lastErr.message : ''}`);
}

const bodyOf = (msg) => `${(msg && msg.Text) || ''}\n${(msg && msg.HTML) || ''}`;

/** Extract an N-digit OTP code (default 6) from a message. */
function extractOtp(msg, digits = 6) {
  const m = bodyOf(msg).match(new RegExp(`\\b(\\d{${digits}})\\b`));
  return m ? m[1] : null;
}

/** Extract the first link (optionally matching a pattern) from a message. */
function extractLink(msg, pattern) {
  const links = bodyOf(msg).match(/https?:\/\/[^\s"'<>)]+/g) || [];
  return pattern ? links.find((l) => pattern.test(l)) || null : links[0] || null;
}

module.exports = { BASE, api, listMessages, search, getMessage, deleteAll, isUp, waitForMessage, extractOtp, extractLink };
