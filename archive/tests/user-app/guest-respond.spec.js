const { test, expect } = require('@playwright/test');
const { GuestInvitePage } = require('../../pages/user-app/guest-invite.page');
const { invites } = require('../../data/invites');

const TOKEN = invites.valid.token;

// Seeded guests on the Birthday Party event with known RSVP states. Used to verify
// each RSVP state (and persistence on revisit) WITHOUT mutating data.
const PENDING_GUEST = 'Benjamin Tester'; // RSVP: Pending
const CONFIRMED_GUEST = 'Femo Tester'; // RSVP: Confirmed

test.describe('Guest Respond to Invite @guest @guest-respond @regression', () => {
  test.beforeEach(() => {
    test.skip(!TOKEN, 'Set GUEST_INVITE_TOKEN in .env to run guest specs.');
  });

  test('should show "Awaiting your response" with Accept and Decline for a pending guest @smoke', async ({ page }) => {
    const invite = new GuestInvitePage(page);
    await invite.viewAs(TOKEN, PENDING_GUEST);

    await expect(invite.rsvpStatus).toContainText('Awaiting your response');
    await expect(invite.acceptButton).toBeVisible();
    await expect(invite.declineButton).toBeVisible();
  });

  test('should show "You\'re going!" for a guest who has accepted (persists on revisit)', async ({ page }) => {
    const invite = new GuestInvitePage(page);
    await invite.viewAs(TOKEN, CONFIRMED_GUEST);

    await expect(page.getByText(/You're going!/)).toBeVisible();
  });

  test('should keep Accept and Decline available to change the response', async ({ page }) => {
    const invite = new GuestInvitePage(page);
    await invite.viewAs(TOKEN, CONFIRMED_GUEST);

    await expect(invite.acceptButton).toBeVisible();
    await expect(invite.declineButton).toBeVisible();
  });
});
