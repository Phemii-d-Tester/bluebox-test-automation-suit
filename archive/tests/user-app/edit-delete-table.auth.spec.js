const { test, expect } = require('@playwright/test');
const { FloorPlanPage } = require('../../pages/user-app/floor-plan.page');
const { SEEDED_EVENTS } = require('../../data/seededEvents');

const EVENT = SEEDED_EVENTS.birthdayParty;

// Edit & Delete Table (#27)
// -------------------------------------------------------------------------
// The inline table EDIT/DELETE state is opened by SELECTING a table, which could
// not be reliably automated: canvas table markers are intercepted by the drag
// overlay (single/double click are no-ops), the left-panel table rows are not
// exposed as interactive elements, and "More table options" opens the Add Table
// dialog rather than an edit state. The two interaction tests are marked fixme
// and flagged for the team (needs an accessible affordance / data-testid).
//
// Verified here: the left-panel Tables list reflects each table's name and fill.
test.describe('Edit & Delete Table @edit-table @regression', () => {
  let floor;

  test.beforeEach(async ({ page }) => {
    floor = new FloorPlanPage(page);
    await floor.goto(EVENT.id);
  });

  test('should list tables with name and current fill in the left panel @smoke', async () => {
    await expect(floor.tablesLabel).toBeVisible();
    await expect(floor.sidebar).toContainText('Table 1');
    await expect(floor.sidebar).toContainText(/\d+\/\d+/); // fill e.g. 1/2
  });

  // eslint-disable-next-line no-empty-pattern
  test.fixme('should open an inline edit state with editable name and seat count', async () => {
    // BLOCKED: cannot reliably select a table to open its edit state (see header).
  });

  test.fixme('should delete a table with confirmation and return guests to Unassigned', async () => {
    // BLOCKED: edit/delete affordance not automatable (see header).
  });
});
