const { test, expect } = require('@playwright/test');
const { FloorPlanPage } = require('../../pages/user-app/floor-plan.page');
const { SEEDED_EVENTS } = require('../../data/seededEvents');

const EVENT = SEEDED_EVENTS.birthdayParty;

// Structural coverage of the seat-assignment UI. The live drag-and-drop (@dnd-kit)
// and Auto-Assign mutation are intentionally NOT automated here: dnd-kit drags are
// flaky to drive headlessly, and assignments persist on the only seeded event that
// has guests + tables (no cleanup). Flagged in the report.
test.describe('Drag Guest to Seat @drag-guest @regression', () => {
  let floor;

  test.beforeEach(async ({ page }) => {
    floor = new FloorPlanPage(page);
    await floor.goto(EVENT.id);
  });

  test('should show the Unassigned Guests panel with a search box @smoke', async () => {
    await expect(floor.unassignedHeading).toBeVisible();
    await expect(floor.guestSearch).toBeVisible();
  });

  test('should list draggable unassigned guests', async () => {
    // Guests stream into the panel after load — wait for one to render.
    await expect(floor.unassignedGuestCards.first()).toBeVisible();
  });

  test('should show per-table fill counts (e.g. 1/2)', async () => {
    await expect(floor.tablesLabel).toBeVisible();
    await expect(floor.sidebar).toContainText(/\d+\/\d+/);
  });

  test('should offer an Auto-Assign All button', async () => {
    await expect(floor.autoAssignAllButton).toBeVisible();
  });

  test('should show the status legend (Active, On Break, Done)', async () => {
    await expect(floor.statusLegend).toBeVisible();
    await expect(floor.main).toContainText('Active');
    await expect(floor.main).toContainText('On Break');
    await expect(floor.main).toContainText('Done');
  });
});
