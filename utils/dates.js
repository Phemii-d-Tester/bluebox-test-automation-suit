// Date/time helpers — always relative to "now" so tests never expire or backdate
// accidentally. Returns the YYYY-MM-DD / HH:mm strings the wizard's native
// date/time inputs expect.

/** Format a Date as YYYY-MM-DD (local). */
function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** A date `days` in the future (default 30). */
function futureDate(days = 30) {
  return toISODate(new Date(Date.now() + days * 86_400_000));
}

/** A date `days` in the past (default 1) — used to assert backdating is rejected. */
function pastDate(days = 1) {
  return toISODate(new Date(Date.now() - days * 86_400_000));
}

module.exports = { toISODate, futureDate, pastDate };
