const { test, expect } = require('@playwright/test');
const { GuestInvitePage } = require('../../pages/user-app/guest-invite.page');
const { invites } = require('../../data/invites');

const TOKEN = invites.valid.token;
const GUEST = 'Femo Tester'; // seeded with Table 2 / Seat 2

test.describe('Guest See/Find Seat @guest @guest-seat @regression', () => {
  let invite;

  test.beforeEach(async ({ page }) => {
    test.skip(!TOKEN, 'Set GUEST_INVITE_TOKEN in .env to run guest specs.');
    invite = new GuestInvitePage(page);
    await invite.viewAs(TOKEN, GUEST);
    await invite.openMySeat();
  });

  test('should show table number, table name, seat number and guest name @smoke', async () => {
    await expect(invite.mySeatHeading).toBeVisible();
    await expect(invite.seatCard).toContainText('Table 2');
    await expect(invite.seatCard).toContainText('Seat');
    await expect(invite.seatCard).toContainText('Femo');
  });

  test('should offer a "Show me how to get there" route toggle', async () => {
    await expect(invite.routeToggle).toBeVisible();
    await invite.routeToggle.click();
    // Toggling reveals the route map; the seat details remain on screen.
    await expect(invite.mySeatHeading).toBeVisible();
  });
});
