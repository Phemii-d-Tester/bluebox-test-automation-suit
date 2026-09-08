const { test, expect } = require('@playwright/test');
const { SeatSetupPage } = require('../../pages/user-app/seat-setup.page');
const { FIXTURES } = require('../../data/testFixtures');
const { uniqueSuffix } = require('../../utils/generators');

const EVENT_ID = FIXTURES.activeEvent.id;

// All @publish — these mutate the floor plan of the (disposable) fixture event.
test.describe('Seat Setup — advanced @seat-setup @publish @regression', () => {
  let seat;

  test.beforeEach(async ({ page }) => {
    seat = new SeatSetupPage(page);
    await seat.openEditor(EVENT_ID);
  });

  test('should place a stage + restroom and block a stage position taken by the door/restroom', async ({ page }) => {
    // Put the door at Top Left and the restroom at Top Center.
    await seat.doorPositionButton.click();
    await seat.positionOption('Top Left').click();
    await page.waitForTimeout(600);
    await seat.restroomPositionButton.click();
    await seat.positionOption('Top Center').click();
    await page.waitForTimeout(600);

    // Opening the Stage menu: the door's + restroom's positions must be disabled.
    await seat.stagePositionButton.click();
    await expect(seat.positionOption('Top Left')).toBeDisabled();
    await expect(seat.positionOption('Top Center')).toBeDisabled();
    // A free slot is selectable → place the stage there.
    await expect(seat.positionOption('Bottom Center')).toBeEnabled();
    await seat.positionOption('Bottom Center').click();
    await page.waitForTimeout(800);

    // Stage + Door + Restroom are now on the canvas.
    await expect(seat.stageMarker.first()).toBeVisible();
    await expect(seat.doorMarker.first()).toBeVisible();
    await expect(seat.restroomMarker.first()).toBeVisible();
  });

  test('should create a uniquely-titled zone and reject a duplicate title', async () => {
    const name = `QA Zone ${uniqueSuffix()}`;
    await seat.addZoneButton.click();
    await seat.zoneNameInput.fill(name);
    await seat.createZoneButton.click();
    await expect(seat.zoneDialog).toBeHidden({ timeout: 10_000 }); // created

    // Same title again → creation is blocked (the modal stays open).
    await seat.addZoneButton.click();
    await seat.zoneNameInput.fill(name);
    await seat.createZoneButton.click();
    await expect(seat.zoneDialog).toBeVisible();
    await seat.cancelZoneButton.click();
  });

  test('should apply the selected table shape when creating a table', async ({ page }) => {
    await seat.addTableButton.click();
    // Selecting a shape highlights it (blue) ...
    await seat.tableShape('Square').click();
    await expect(seat.tableShape('Square')).toHaveClass(/bg-\[#4157fb\]/);
    await seat.tableCapacity.fill('4');
    await seat.tableNumber.fill(String((Date.now() % 9000) + 100)); // avoid number collisions
    await seat.tableNameInput.fill(`QA T${uniqueSuffix()}`);
    // ... and the create request carries that shape (SQUARE), and the table persists.
    const [req, res] = await Promise.all([
      page.waitForRequest((r) => r.method() === 'POST' && /\/tables$/.test(r.url())),
      page.waitForResponse((r) => r.request().method() === 'POST' && /\/tables$/.test(r.url())),
      seat.addTableSubmit.click(),
    ]);
    expect(JSON.parse(req.postData() || '{}').shape).toBe('SQUARE'); // selected shape is applied
    expect(res.ok()).toBeTruthy(); // table persisted
  });

  // Manual drag-assign has no accessible drop target (no seat/table elements are
  // exposed to the a11y tree; @dnd-kit only accepts pixel drags), so it can't be
  // driven reliably headlessly. Auto-Assign (below) covers assigning guests to
  // tables. Flagged for follow-up (assign via API, or add data-testids to seats).
  test.fixme('should assign a specific guest to a table by drag-and-drop', async () => {});

  test('should auto-assign unassigned guests to seats', async ({ page }) => {
    const before = await seat.unassignedGuestCards.count();
    test.skip(before === 0, 'No unassigned guests to auto-assign.');
    await seat.autoAssignButton.click();
    // A confirmation may appear — accept it if so.
    const confirm = page.getByRole('button', { name: /^(Auto-Assign|Confirm|Assign|Continue|Yes)$/ });
    if (await page.getByRole('dialog').count()) await confirm.first().click().catch(() => {});
    // Unassigned count drops (subject to available seats).
    await expect.poll(async () => seat.unassignedGuestCards.count(), { timeout: 20_000 }).toBeLessThan(before);
  });
});
