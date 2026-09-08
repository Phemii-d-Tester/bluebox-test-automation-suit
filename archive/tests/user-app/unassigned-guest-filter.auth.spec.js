const { test, expect } = require('@playwright/test');
const { FloorPlanPage } = require('../../pages/user-app/floor-plan.page');
const { SEEDED_EVENTS } = require('../../data/seededEvents');

const EVENT = SEEDED_EVENTS.birthdayParty;

// Unassigned Guest filter (#29) — the floor editor Groups filter.
// Structural coverage is solid; the exclusion behaviour (selecting a group hides
// guests from other groups) can't be demonstrated on the seeded data, which has
// effectively a single group (selecting it left the unassigned count unchanged).
// Flagged — re-enable the fixme test on data with ≥2 groups.
test.describe('Unassigned Guest filter @unassigned-filter @regression', () => {
  let floor;

  test.beforeEach(async ({ page }) => {
    floor = new FloorPlanPage(page);
    await floor.goto(EVENT.id);
  });

  test('should show the Groups filter in the floor editor @smoke', async () => {
    await expect(floor.groupsFilter).toBeVisible();
  });

  test('should expose the event groups when the Groups filter is opened', async () => {
    await floor.groupsFilter.click();
    await expect(floor.main.getByRole('button', { name: /Aso-ebi Geng/ }).first()).toBeVisible();
  });

  test('should show unassigned guests labelled with their group', async () => {
    await expect(floor.unassignedGuestCards.first()).toBeVisible();
    await expect(floor.sidebar).toContainText('Aso-ebi Geng');
  });

  test.fixme('should filter the unassigned list to a selected group', async () => {
    // BLOCKED on data: seeded event has effectively one group, so selecting it
    // does not change the unassigned list (no other group to exclude).
  });
});
