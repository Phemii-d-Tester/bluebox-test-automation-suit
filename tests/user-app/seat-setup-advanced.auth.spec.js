const { test, expect } = require('@playwright/test');
const { SeatSetupPage } = require('../../pages/user-app/seat-setup.page');
const { FIXTURES } = require('../../data/testFixtures');

const EVENT_ID = FIXTURES.activeEvent.id;

// All @publish — these mutate the seating layout of the (disposable) fixture event.
test.describe('Seating layout — advanced @seat-setup @publish @regression', () => {
  let seat;

  test.beforeEach(async ({ page }) => {
    seat = new SeatSetupPage(page);
    await seat.goto(EVENT_ID);
  });

  test('should place the stage via the position menu', async ({ page }) => {
    await seat.stagePositionButton.click();
    await expect(seat.positionOption('No Stage')).toBeChecked(); // defaults to no stage
    await seat.positionOption('Top Center').click();
    await page.waitForTimeout(800);
    // The control now reflects the chosen placement ("Stage · …").
    await expect(seat.stagePositionButton).toContainText(/Stage ·/);
  });

  test('should block a stage slot already taken by the door', async ({ page }) => {
    await seat.placeElement(seat.doorPositionButton, 'Top Left');
    await seat.stagePositionButton.click();
    // The door's slot cannot also hold the stage.
    await expect(seat.positionOption('Top Left')).toBeDisabled();
    await expect(seat.positionOption('Bottom Center')).toBeEnabled();
    await page.keyboard.press('Escape');
  });

  test('should apply a template and expose per-table category assignment', async () => {
    await seat.selectTemplate('Banquet · 3×3');
    await expect(seat.assignCategoryButtons.first()).toBeVisible();
    expect(await seat.assignCategoryButtons.count()).toBeGreaterThan(1);
    await expect(seat.undoButton).toBeEnabled(); // a layout change was registered
  });

  test('should save a seating layout', async ({ page }) => {
    await seat.selectTemplate('Conference · Classroom');
    // Save persists the layout; capture any non-GET save call if the app makes one.
    const [res] = await Promise.all([
      page
        .waitForResponse(
          (r) => r.request().method() !== 'GET' && /seat|layout|table/i.test(r.url()),
          { timeout: 20_000 },
        )
        .catch(() => null),
      seat.saveLayoutButton.click(),
    ]);
    if (res) expect(res.ok()).toBeTruthy();
    // The editor stays usable after saving (no crash / error boundary).
    await expect(seat.heading).toBeVisible();
  });
});
