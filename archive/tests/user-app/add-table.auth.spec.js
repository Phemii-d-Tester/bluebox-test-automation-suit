const { test, expect } = require('@playwright/test');
const { FloorPlanPage } = require('../../pages/user-app/floor-plan.page');
const { AddTableDialog } = require('../../pages/user-app/add-table.dialog');
const { SEEDED_EVENTS } = require('../../data/seededEvents');
const { uniqueSuffix } = require('../../utils/generators');

const EVENT = SEEDED_EVENTS.birthdayParty;

test.describe('Add Table @add-table @regression', () => {
  // Modal-only checks on the shared event — never submit, so nothing persists.
  test.describe('Add Table modal (no save)', () => {
    let floor;
    let table;

    test.beforeEach(async ({ page }) => {
      floor = new FloorPlanPage(page);
      table = new AddTableDialog(page);
      await floor.goto(EVENT.id);
      await floor.addTableButton.click();
      await expect(table.heading).toBeVisible();
    });

    test('should open with Zone, Table #, Capacity, Name, Shape and Add CTA @smoke', async () => {
      await expect(table.zoneSelect).toBeVisible();
      await expect(table.tableNumber).toBeVisible();
      await expect(table.capacity).toBeVisible();
      await expect(table.name).toBeVisible();
      await expect(table.submitButton).toBeVisible();
    });

    test('should have an editable seat count (Capacity)', async () => {
      await expect(table.capacity).not.toHaveValue('');
      await table.capacity.fill('10');
      await expect(table.capacity).toHaveValue('10');
    });

    test('should offer the shape options', async () => {
      await expect(table.shapeRound).toBeVisible();
      await expect(table.shapeRectangle).toBeVisible();
      await expect(table.shapeSquare).toBeVisible();
      await expect(table.shapeOval).toBeVisible();
    });

    test('should dismiss on Close', async () => {
      await table.closeButton.click();
      await expect(table.dialog).toBeHidden();
    });
  });

  // @publish: persists a table on the seeded event (editor already activated; the
  // table cannot be deleted afterwards, so each on-demand run adds one). On demand.
  test.describe('Persisting a table', () => {
    test('should add a table that appears on the canvas @publish', async ({ page }) => {
      const floor = new FloorPlanPage(page);
      const table = new AddTableDialog(page);
      await floor.goto(EVENT.id);

      const before = await floor.canvasTables.count();
      await floor.addTableButton.click();
      await expect(table.heading).toBeVisible();
      await table.add({ capacity: 6, name: `QA Table ${uniqueSuffix()}` });

      await expect(table.dialog).toBeHidden({ timeout: 10_000 });
      await expect(floor.canvasTables).toHaveCount(before + 1, { timeout: 10_000 });
    });
  });
});
