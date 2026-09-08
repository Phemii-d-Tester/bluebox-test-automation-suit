const { test, expect } = require('@playwright/test');
const { FloorPlanPreviewPage } = require('../../pages/user-app/floor-plan-preview.page');
const { SEEDED_EVENTS } = require('../../data/seededEvents');

const EVENT = SEEDED_EVENTS.birthdayParty;

test.describe('Floor Plan @floor-plan @regression', () => {
  let preview;

  test.beforeEach(async ({ page }) => {
    preview = new FloorPlanPreviewPage(page);
    await preview.goto(EVENT.id);
  });

  test('should show Total Seats, Assigned and Available stats @smoke', async () => {
    await expect(preview.totalSeatsStat).toBeVisible();
    await expect(preview.assignedStat).toBeVisible();
    await expect(preview.availableStat).toBeVisible();
  });

  test('should show the floor plan preview with an Open Seat Setup link', async () => {
    await expect(preview.floorPlanHeading).toBeVisible();
    await expect(preview.openSeatSetupLink).toHaveAttribute('href', `/seat-setup/${EVENT.id}`);
  });

  test('should show zones with names, seat counts and a layout type', async () => {
    await expect(preview.floorPlanCard).toContainText('Aso Ebi Geng');
    await expect(preview.floorPlanCard).toContainText(/\d+\/\d+ seats/);
    await expect(preview.floorPlanCard).toContainText(/Circular|Grid/);
  });

  test('should navigate to the Seat Setup editor via Open Seat Setup', async ({ page }) => {
    await preview.openSeatSetupLink.click();
    await expect(page).toHaveURL(new RegExp(`/seat-setup/${EVENT.id}`));
    await expect(page.getByRole('button', { name: 'Add Table' })).toBeVisible({ timeout: 30_000 });
  });
});
