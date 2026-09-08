const { test, expect } = require('@playwright/test');
const { FloorPlanPage } = require('../../pages/user-app/floor-plan.page');
const { SEEDED_EVENTS } = require('../../data/seededEvents');

const EVENT = SEEDED_EVENTS.birthdayParty;

test.describe('Open Floor @open-floor @regression', () => {
  let floor;

  test.beforeEach(async ({ page }) => {
    floor = new FloorPlanPage(page);
    await floor.goto(EVENT.id);
  });

  test('should open the editor with Add Table, Add Zone and Auto-Assign @smoke', async () => {
    await expect(floor.addTableButton).toBeVisible();
    await expect(floor.addZoneButton).toBeVisible();
    await expect(floor.autoAssignButton).toBeVisible();
  });

  test('should show the Unassigned Guests panel with a search box', async () => {
    await expect(floor.unassignedHeading).toBeVisible();
    await expect(floor.guestSearch).toBeVisible();
    await expect(floor.autoAssignAllButton).toBeVisible();
  });

  test('should show the Tables list', async () => {
    await expect(floor.tablesLabel).toBeVisible();
    await expect(floor.sidebar).toContainText('Table 1');
  });

  test('should show Door and Stage position selectors', async () => {
    await expect(floor.doorPosition).toBeVisible();
    await expect(floor.stagePosition).toBeVisible();
  });

  test('should offer the 12 door/stage positions', async () => {
    await floor.doorPosition.click();
    const options = floor.page.getByRole('option');
    await expect(options).toHaveCount(12);
    await expect(floor.page.getByRole('option', { name: 'Top Center', exact: true })).toBeVisible();
    await expect(floor.page.getByRole('option', { name: 'Bottom Center', exact: true })).toBeVisible();
  });

  test('should show the Groups, Dietary and Zone Servers filters', async () => {
    await expect(floor.groupsFilter).toBeVisible();
    await expect(floor.dietaryFilter).toBeVisible();
    await expect(floor.zoneServersFilter).toBeVisible();
  });

  test('should render zones, tables and stage/door markers on the canvas', async () => {
    expect(await floor.canvasTables.count()).toBeGreaterThan(0);
    expect(await floor.canvasZones.count()).toBeGreaterThan(0);
    await expect(floor.doorMarker).toBeVisible();
    await expect(floor.stageMarker).toBeVisible();
  });
});
