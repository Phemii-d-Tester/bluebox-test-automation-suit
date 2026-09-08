const { test, expect } = require('@playwright/test');
const { EventDetailPage } = require('../../pages/user-app/event-detail.page');
const { FIXTURES } = require('../../data/testFixtures');

const EVENT_ID = FIXTURES.activeEvent.id;

test.describe('Activate / Deactivate event @activate @regression', () => {
  let detail;

  test.beforeEach(async ({ page }) => {
    detail = new EventDetailPage(page);
    await detail.goto(EVENT_ID);
  });

  test('should show the event with the activate/deactivate control and tabs @smoke', async () => {
    await expect(detail.title).toBeVisible();
    // Either "Deactivate" (active) or "Go public"/"Activate" (inactive) is present.
    const toggle = detail.deactivateButton.or(detail.activateButton);
    await expect(toggle.first()).toBeVisible();
    await expect(detail.guestsTab).toBeVisible();
    await expect(detail.seatingTab).toBeVisible();
  });

  // @publish toggles the event's active state, then restores it.
  test('should toggle the event active state and restore it @publish', async () => {
    const wasActive = await detail.isActive();
    if (wasActive) {
      await detail.deactivateButton.click();
      await expect(detail.activateButton).toBeVisible({ timeout: 15_000 });
      await detail.activateButton.click(); // restore
      await expect(detail.deactivateButton).toBeVisible({ timeout: 15_000 });
    } else {
      await detail.activateButton.click();
      await expect(detail.deactivateButton).toBeVisible({ timeout: 15_000 });
      await detail.deactivateButton.click(); // restore
      await expect(detail.activateButton).toBeVisible({ timeout: 15_000 });
    }
  });
});
