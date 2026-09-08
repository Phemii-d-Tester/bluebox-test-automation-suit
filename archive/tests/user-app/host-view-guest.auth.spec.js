const { test, expect } = require('@playwright/test');
const { GuestsPage } = require('../../pages/user-app/guests.page');
const { GuestProfilePanel } = require('../../pages/user-app/guest-profile.panel');
const { SEEDED_EVENTS } = require('../../data/seededEvents');

const EVENT = SEEDED_EVENTS.birthdayParty;
const GUEST = 'Femo Tester'; // seeded: Confirmed, Aso-ebi Geng, Table 2 / Seat 2

// Read-only: never clicks Delete Guest Data (GDPR), so the seeded guest is safe.
test.describe('Host View Guest @host-view-guest @regression', () => {
  let panel;

  test.beforeEach(async ({ page }) => {
    const guests = new GuestsPage(page);
    await guests.goto(EVENT.id);
    await guests.openGuest(GUEST);
    panel = new GuestProfilePanel(page, GUEST);
    await expect(panel.heading).toBeVisible();
  });

  test('should show RSVP, group, table and seat with a Change Seat control @smoke', async () => {
    await expect(panel.rsvpSeatingSection).toBeVisible();
    await expect(panel.dialog).toContainText('Confirmed');
    await expect(panel.dialog).toContainText('Aso-ebi Geng');
    await expect(panel.dialog).toContainText('Table 2');
    await expect(panel.changeSeatButton).toBeVisible();
  });

  test('should show the dietary profile tags', async () => {
    await expect(panel.dietaryProfileSection).toBeVisible();
    await expect(panel.dialog).toContainText('Gluten Free');
    await expect(panel.dialog).toContainText('Dairy Free');
  });

  test('should show Orders, Service Requests and Post-Event Feedback tabs with counts', async () => {
    await expect(panel.ordersTab).toContainText(/Orders\s*\(\d+\)/);
    await expect(panel.serviceRequestsTab).toContainText(/Service Requests\s*\(\d+\)/);
    await expect(panel.feedbackTab).toBeVisible();
  });

  test('should offer Export Profile and Delete Guest Data (GDPR) actions', async () => {
    await expect(panel.exportProfileButton).toBeVisible();
    await expect(panel.deleteGuestButton).toBeVisible();
  });
});
