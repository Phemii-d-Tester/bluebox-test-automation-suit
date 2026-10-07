const { test, expect } = require('@playwright/test');
const { SeatSetupPage } = require('../../pages/user-app/seat-setup.page');
const { FIXTURES } = require('../../data/testFixtures');

const EVENT_ID = FIXTURES.activeEvent.id;
const TEMPLATES = ['Banquet · 4×4', 'Banquet · 3×3', 'Wedding · Reception', 'Conference · Classroom'];

// Structural, non-destructive checks of the template-based Seating layout editor.
test.describe('Seating layout @seat-setup @regression', () => {
  let seat;

  test.beforeEach(async ({ page }) => {
    seat = new SeatSetupPage(page);
    await seat.goto(EVENT_ID);
  });

  test('should show the Seating layout editor with a Back to Event link @smoke', async () => {
    await expect(seat.heading).toBeVisible();
    await expect(seat.backToEventLink).toHaveAttribute('href', new RegExp(`/events/${EVENT_ID}\\?tab=Seating`));
    await expect(seat.saveLayoutButton).toBeVisible();
  });

  test('should offer stage, door and restroom position controls', async () => {
    await expect(seat.stagePositionButton).toBeVisible();
    await expect(seat.doorPositionButton).toBeVisible();
    await expect(seat.restroomPositionButton).toBeVisible();
  });

  test('should present the layout templates @smoke', async () => {
    await expect(seat.templatesHeading).toBeVisible();
    for (const t of TEMPLATES) {
      await expect(seat.templateButton(t)).toBeVisible();
    }
  });

  test('should open the stage position menu with placement options', async ({ page }) => {
    await seat.stagePositionButton.click();
    await expect(seat.positionOption('No Stage')).toBeVisible();
    await expect(seat.positionOption('Top Left')).toBeVisible();
    await expect(seat.positionOption('Bottom Center')).toBeVisible();
    await page.keyboard.press('Escape'); // close without changing anything
  });
});
