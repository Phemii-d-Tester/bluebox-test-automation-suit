const { test, expect } = require('@playwright/test');
const { FloorPlanPage } = require('../../pages/user-app/floor-plan.page');
const { AddZoneDialog } = require('../../pages/user-app/add-zone.dialog');
const { SEEDED_EVENTS } = require('../../data/seededEvents');
const { uniqueSuffix } = require('../../utils/generators');

const EVENT = SEEDED_EVENTS.birthdayParty;

test.describe('Create Zone @create-zone @regression', () => {
  // Modal-only checks on the shared event — never click Create, so nothing persists.
  test.describe('New Zone modal (no save)', () => {
    let floor;
    let zone;

    test.beforeEach(async ({ page }) => {
      floor = new FloorPlanPage(page);
      zone = new AddZoneDialog(page);
      await floor.goto(EVENT.id);
      await floor.addZoneButton.click();
      await expect(zone.heading).toBeVisible();
    });

    test('should open with Zone Name, colours and Create / Cancel @smoke', async () => {
      await expect(zone.zoneName).toBeVisible();
      await expect(zone.createButton).toBeVisible();
      await expect(zone.cancelButton).toBeVisible();
    });

    test('should offer a colour palette', async () => {
      expect(await zone.colourSwatches.count()).toBeGreaterThanOrEqual(6);
    });

    test('should accept a zone name', async () => {
      await zone.zoneName.fill('VIP Section');
      await expect(zone.zoneName).toHaveValue('VIP Section');
    });

    test('should dismiss without creating on Cancel', async () => {
      await zone.cancelButton.click();
      await expect(zone.dialog).toBeHidden();
    });
  });

  // @publish: persists a zone. Runs against the seeded event (its seating is
  // already activated, so the editor is available — a fresh event would show the
  // "Activate Seat Setup" gate instead). The zone cannot be deleted afterwards, so
  // each on-demand run adds one uniquely-named zone. On demand only.
  test.describe('Persisting a zone', () => {
    test('should add a zone that shows on the canvas and in Zone Servers @publish', async ({ page }) => {
      const floor = new FloorPlanPage(page);
      const zone = new AddZoneDialog(page);
      await floor.goto(EVENT.id);

      const name = `QA Zone ${uniqueSuffix()}`;
      await floor.addZoneButton.click();
      await expect(zone.heading).toBeVisible();
      await zone.create({ name });
      await expect(zone.dialog).toBeHidden({ timeout: 10_000 });

      // Appears on the canvas...
      await expect(
        floor.main.getByRole('button', { name: new RegExp(`Drag zone ${name}`) })
      ).toBeVisible({ timeout: 10_000 });
      // ...and in the Zone Servers filter.
      await floor.zoneServersFilter.click();
      await expect(floor.main.getByText(name).first()).toBeVisible();
    });
  });
});
