const { test, expect } = require('@playwright/test');
const { SeatSetupPage } = require('../../pages/user-app/seat-setup.page');
const { FIXTURES } = require('../../data/testFixtures');

const EVENT_ID = FIXTURES.activeEvent.id;

test.describe('Seat Setup / Floor Plan @seat-setup @regression', () => {
  let seat;

  test.beforeEach(async ({ page }) => {
    seat = new SeatSetupPage(page);
    await seat.goto(EVENT_ID);
  });

  test('should show the Seat Setup page with Back and Preview @smoke', async () => {
    await expect(seat.heading).toBeVisible();
    await expect(seat.backLink).toHaveAttribute('href', '/seat-setup');
    await expect(seat.previewLink).toHaveAttribute('href', new RegExp(`/events/${EVENT_ID}`));
  });

  test('should show the floor plan editor toolbar and unassigned panel', async () => {
    await seat.openEditor(EVENT_ID);
    await expect(seat.addTableButton).toBeVisible();
    await expect(seat.addZoneButton).toBeVisible();
    await expect(seat.autoAssignButton).toBeVisible();
    await expect(seat.unassignedHeading).toBeVisible();
  });

  test('should offer stage, door and restroom position controls', async () => {
    await seat.openEditor(EVENT_ID);
    await expect(seat.stagePositionButton).toBeVisible();
    await expect(seat.doorPositionButton).toBeVisible();
    await expect(seat.restroomPositionButton).toBeVisible();
  });
});
