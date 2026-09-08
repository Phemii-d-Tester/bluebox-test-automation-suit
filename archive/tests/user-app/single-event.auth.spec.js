const { test, expect } = require('@playwright/test');
const { SingleEventPage } = require('../../pages/user-app/single-event.page');
const { SEEDED_EVENTS } = require('../../data/seededEvents');

const EVENT = SEEDED_EVENTS.birthdayParty;

test.describe('Single Event View @single-event @regression', () => {
  let view;

  test.beforeEach(async ({ page }) => {
    view = new SingleEventPage(page);
    await view.goto(EVENT.id);
  });

  test.describe('Header', () => {
    test('should show the event name, date, venue and status @smoke', async () => {
      await expect(view.title).toHaveText(EVENT.name);
      await expect(view.main).toContainText(EVENT.date);
      await expect(view.main).toContainText(EVENT.venue);
      await expect(view.statusBadge).toBeVisible();
    });

    test('should link Back to the events list', async () => {
      await expect(view.backLink).toHaveAttribute('href', '/events');
    });

    test('should expose Edit and Share QR actions', async () => {
      await expect(view.editLink).toHaveAttribute('href', `/events/${EVENT.id}/edit`);
      await expect(view.shareQrButton).toBeVisible();
    });

    test('should show all five tabs', async () => {
      await expect(view.tabOverview).toBeVisible();
      await expect(view.tabGuests).toBeVisible();
      await expect(view.tabSeating).toBeVisible();
      await expect(view.tabServices).toBeVisible();
      await expect(view.tabAnalytics).toBeVisible();
    });
  });

  test.describe('Overview tab', () => {
    test('should show the summary stats (Confirmed, Checked In, Orders) @smoke', async () => {
      await expect(view.confirmedStat).toBeVisible();
      await expect(view.checkedInStat).toBeVisible();
      await expect(view.ordersStat).toBeVisible();
    });

    test('should show the Seating and Food & Drinks module cards', async () => {
      await expect(view.seatingModuleCard).toBeVisible();
      await expect(view.foodModuleCard).toBeVisible();
      await expect(view.openModuleLink).toHaveAttribute('href', new RegExp(`/food-drinks/${EVENT.id}`));
    });

    test('should show the QR Codes & Links section with a guest invite link', async () => {
      await expect(view.qrHeading).toBeVisible();
      await expect(view.inviteUrl).toBeVisible();
    });

    test('should show Timeline, My Roles and Invite Collaborator sections', async () => {
      await expect(view.timelineHeading).toBeVisible();
      await expect(view.myRolesHeading).toBeVisible();
      await expect(view.currentRole).toBeVisible();
      await expect(view.inviteCollabHeading).toBeVisible();
    });

    test('should require an email before a collaborator can be invited', async () => {
      await expect(view.inviteEmailInput).toBeVisible();
      await expect(view.inviteButton).toBeDisabled();
    });
  });

  test.describe('Tab navigation', () => {
    test('should switch to Seating (Floor Plan) and back to Overview', async () => {
      await view.tabSeating.click();
      await expect(view.floorPlanHeading).toBeVisible();
      await expect(view.qrHeading).toBeHidden(); // Overview-only content is gone

      await view.tabOverview.click();
      await expect(view.qrHeading).toBeVisible();
    });

    test('every tab should be selectable without breaking the page', async () => {
      for (const tab of [view.tabGuests, view.tabServices, view.tabAnalytics, view.tabOverview]) {
        await tab.click();
        await expect(view.title).toHaveText(EVENT.name); // header persists; no crash
      }
    });
  });
});
