const { test, expect } = require('@playwright/test');
const { GuestRsvpPage } = require('../../pages/user-app/guest-rsvp.page');
const { FIXTURES } = require('../../data/testFixtures');
const { uniqueSuffix } = require('../../utils/generators');

const TOKEN = FIXTURES.activeEvent.token;

test.describe('Guest RSVP @guest @rsvp @regression', () => {
  let rsvp;

  test.beforeEach(async ({ page }) => {
    rsvp = new GuestRsvpPage(page);
    await rsvp.goto(TOKEN);
  });

  test('should show the RSVP landing with the event and CTAs @smoke', async () => {
    await expect(rsvp.invitedHeading).toBeVisible();
    await expect(rsvp.eventName).toBeVisible();
    await expect(rsvp.rsvpCta).toBeVisible();
    await expect(rsvp.poweredBy).toBeVisible();
  });

  test('should link to Find Seat and Select Meals', async () => {
    await expect(rsvp.findSeatLink).toHaveAttribute('href', new RegExp(`/invite/${TOKEN}`));
    await expect(rsvp.selectMealsLink).toHaveAttribute('href', new RegExp(`/invite/${TOKEN}`));
  });

  test('should open the RSVP form with the required fields', async () => {
    await rsvp.openForm();
    await expect(rsvp.awaitingHeading).toBeVisible();
    await expect(rsvp.firstName).toBeVisible();
    await expect(rsvp.email).toBeVisible();
    await expect(rsvp.rsvpSubmit).toBeVisible();
  });

  // @publish adds a guest to the event via the public RSVP form.
  test('should submit an RSVP @publish', async ({ page }) => {
    await rsvp.openForm();
    await rsvp.fill({
      firstName: 'QA',
      lastName: `Rsvp ${uniqueSuffix()}`,
      email: `qa-rsvp-${uniqueSuffix()}@example.com`,
    });
    // RSVP is two-step: submit → "Confirm Acceptance" modal → Confirm RSVP.
    await rsvp.rsvpSubmit.click();
    await expect(rsvp.confirmAcceptanceHeading).toBeVisible({ timeout: 15_000 });
    await rsvp.confirmRsvpButton.click();
    await expect(rsvp.confirmAcceptanceHeading).toBeHidden({ timeout: 20_000 }); // RSVP accepted
  });
});
