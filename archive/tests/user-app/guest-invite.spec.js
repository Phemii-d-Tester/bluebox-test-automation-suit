const { test, expect } = require('@playwright/test');
const { GuestInvitePage } = require('../../pages/user-app/guest-invite.page');
const { invites } = require('../../data/invites');
const { randomGuestName } = require('../../utils/generators');

const { valid, invalid } = invites;

// Skip the data-driven specs cleanly if no seeded invite token is configured,
// rather than failing with a confusing "Invite not found".
test.describe('Guest Invite landing @guest @guest-invite @regression', () => {
  test.beforeEach(() => {
    test.skip(!valid.token, 'Set GUEST_INVITE_TOKEN in .env to run Guest Invite specs.');
  });

  test.describe('Happy path & UI presence', () => {
    test('should display the event invitation details when opening a valid invite link @smoke', async ({ page }) => {
      const invite = new GuestInvitePage(page);
      await invite.goto(valid.token);

      await expect(invite.invitedToLabel).toBeVisible();
      await expect(invite.invitationCard).toBeVisible();
      await expect(invite.eventNameHeading).toHaveText(valid.expected.eventName);
      await expect(invite.invitationCard).toContainText(valid.expected.date);
      await expect(invite.invitationCard).toContainText(valid.expected.time);
      await expect(invite.invitationCard).toContainText(valid.expected.venueName);
      await expect(invite.invitationCard).toContainText(valid.expected.address);
      await expect(invite.statusBadge).toBeVisible();
    });

    test('should show the name prompt and the View My Invitation CTA', async ({ page }) => {
      const invite = new GuestInvitePage(page);
      await invite.goto(valid.token);

      await expect(invite.namePrompt).toBeVisible();
      await expect(invite.nameInput).toBeVisible();
      await expect(invite.nameInput).toBeEmpty();
      await expect(invite.viewInvitationButton).toBeVisible();
    });

    test('should display the Find Your Seat, Select Meals and RSVP bottom tabs @smoke', async ({ page }) => {
      const invite = new GuestInvitePage(page);
      await invite.goto(valid.token);

      await expect(invite.findYourSeatTab).toBeVisible();
      await expect(invite.selectMealsTab).toBeVisible();
      await expect(invite.rsvpTab).toBeVisible();
    });

    test('should display the "Powered by BlueBox" footer', async ({ page }) => {
      const invite = new GuestInvitePage(page);
      await invite.goto(valid.token);

      await expect(invite.poweredBy).toBeVisible();
      await expect(invite.blueboxLink).toBeVisible();
      await expect(invite.blueboxLink).toHaveAttribute('href', '/');
    });
  });

  test.describe('Name input behaviour', () => {
    test('should reveal a Clear control and clear the name when used', async ({ page }) => {
      const invite = new GuestInvitePage(page);
      await invite.goto(valid.token);

      await invite.enterName('Jane Doe');
      await expect(invite.nameInput).toHaveValue('Jane Doe');
      await expect(invite.clearButton).toBeVisible();

      await invite.clearName();
      await expect(invite.nameInput).toBeEmpty();
    });

    // Documents CURRENT behaviour: View My Invitation with an empty name is a
    // silent no-op (no required-field message, no navigation). See "testability
    // gaps" — flagged for product confirmation.
    test('should stay on the invite landing when View My Invitation is clicked with an empty name', async ({ page }) => {
      const invite = new GuestInvitePage(page);
      await invite.goto(valid.token);

      await expect(invite.nameInput).toBeEmpty();
      await invite.viewInvitationButton.click();

      await expect(page).toHaveURL(new RegExp(`/invite/${valid.token}`));
      await expect(invite.invitationCard).toBeVisible();
      await expect(invite.nameInput).toBeVisible();
    });

    // Documents CURRENT behaviour: an unrecognised guest name produces no error
    // and no personalised view. Flagged for product confirmation.
    test('should not navigate or show an error for an unrecognised guest name', async ({ page }) => {
      const invite = new GuestInvitePage(page);
      await invite.goto(valid.token);

      await invite.viewInvitation(randomGuestName());

      await expect(page).toHaveURL(new RegExp(`/invite/${valid.token}`));
      await expect(invite.invitationCard).toBeVisible();
    });
  });
});

test.describe('Guest Invite — invalid link @guest @guest-invite @regression', () => {
  test('should show "Invite not found" for an invalid invite token @smoke', async ({ page }) => {
    const invite = new GuestInvitePage(page);
    await invite.goto(invalid.token);

    await expect(invite.notFoundHeading).toBeVisible();
    await expect(invite.notFoundMessage).toBeVisible();
    await expect(invite.invitationCard).toHaveCount(0);
  });
});
