// Collision-free test-data generators. Keep all uniqueness logic here so specs
// and page objects never hardcode values that could clash across parallel runs.

/** Unique-ish suffix combining time and a random tail. */
function uniqueSuffix() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** A full name that is guaranteed not to match any real guest on an event. */
function randomGuestName() {
  return `Unknown Guest ${uniqueSuffix()}`;
}

module.exports = { uniqueSuffix, randomGuestName };
