const { test, expect } = require('@playwright/test');
const { GuestRsvpPage } = require('../../pages/user-app/guest-rsvp.page');
const { FIXTURES } = require('../../data/testFixtures');

const TOKEN = FIXTURES.foodDrinksEvent.token;

// Guest-facing invite / RSVP flow, exercised in HOST PREVIEW (authenticated): a
// logged-out guest cannot reach a non-public event's invite, and opening an event
// on the shared -test env would fire real invitations, so we verify the invite
// landing and the /join gate as the host previews them. The invite landing a guest
// sees once the event is public is the same view without the host-preview banner.
test.describe('Guest invite & RSVP @guest @rsvp @regression', () => {
  let rsvp;
  test.beforeEach(({ page }) => {
    rsvp = new GuestRsvpPage(page);
  });

  test('should show the invite landing with event details and CTAs @smoke', async () => {
    await rsvp.gotoInvite(TOKEN);
    await expect(rsvp.invitedHeading).toBeVisible();
    await expect(rsvp.eventName).toBeVisible();
    await expect(rsvp.rsvpCta).toBeVisible();
    await expect(rsvp.findSeatButton).toBeVisible();
    await expect(rsvp.selectMealsButton).toBeVisible();
    await expect(rsvp.poweredBy).toBeVisible();
  });

  test('should gate the invitation behind the guest name field', async () => {
    await rsvp.gotoInvite(TOKEN);
    await expect(rsvp.nameInput).toBeVisible();
    await expect(rsvp.viewInvitationButton).toBeDisabled();
    await rsvp.nameInput.fill('QA Guest');
    await expect(rsvp.viewInvitationButton).toBeEnabled();
  });

  test('should block RSVP until the host opens the event', async () => {
    await rsvp.gotoJoin(TOKEN);
    // The fixture event is not public yet, so /join shows the "not open" gate.
    // If it has since been opened, the live RSVP form replaces the gate.
    const notOpen = (await rsvp.notOpenHeading.count()) > 0;
    test.skip(!notOpen, 'Event has been opened — live RSVP form path not covered here.');
    await expect(rsvp.notOpenHeading).toBeVisible();
  });

  // Full RSVP submission requires the event to be public/open. Opening an event on
  // the shared -test environment fires real guest invitations, so this path is left
  // as a documented manual/opt-in step rather than automated here.
  test.fixme('should submit an RSVP on an open event @publish', async () => {});
});
