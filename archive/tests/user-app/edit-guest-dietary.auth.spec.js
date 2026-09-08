const { test, expect } = require('@playwright/test');
const { GuestsPage } = require('../../pages/user-app/guests.page');
const { GuestProfilePanel } = require('../../pages/user-app/guest-profile.panel');
const { SEEDED_EVENTS } = require('../../data/seededEvents');

const EVENT = SEEDED_EVENTS.birthdayParty;
const GUEST = 'Femo Tester'; // dietary: Gluten Free, Dairy Free

// Edit Existing Guest Dietary Tags (#30)
// -------------------------------------------------------------------------
// AC expects clicking a guest row to open an EDITABLE detail panel (all Add-Guest
// fields editable, Save button, dietary edits reflected in the Dietary Report).
// The live panel is READ-ONLY: it shows the profile (RSVP & Seating, Dietary
// Profile) plus Change Seat (disabled), Export Profile and Delete Guest Data — but
// no editable fields and no Save button. The editable-form assertions are marked
// fixme and flagged for the team.
test.describe('Edit Existing Guest Dietary Tags @edit-guest @regression', () => {
  let panel;

  test.beforeEach(async ({ page }) => {
    const guests = new GuestsPage(page);
    await guests.goto(EVENT.id);
    await guests.openGuest(GUEST);
    panel = new GuestProfilePanel(page, GUEST);
    await expect(panel.heading).toBeVisible();
  });

  test('should open the guest detail panel from the row, showing the dietary profile @smoke', async () => {
    await expect(panel.dietaryProfileSection).toBeVisible();
    await expect(panel.dialog).toContainText('Gluten Free');
    await expect(panel.dialog).toContainText('Dairy Free');
  });

  test.fixme('should allow editing all guest fields and dietary tags with a Save button', async () => {
    // BLOCKED: the detail panel is read-only (no editable fields / Save button).
  });

  test.fixme('should reflect dietary edits in the Dietary Report', async () => {
    // BLOCKED: depends on the editable panel above.
  });
});
