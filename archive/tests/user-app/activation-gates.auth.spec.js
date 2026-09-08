const { test, expect } = require('@playwright/test');
const { createEvent } = require('../../utils/eventFactory');

// Host Activate Seat Setup (#25) + Host Activate Food & Drinks (#26).
// Both gates only show on an event whose module is not yet set up, so this spec
// creates a fresh event (hence @publish — it persists and can't be deleted).
// NOTE: the live wording differs from the AC ("No Seat Setup Yet" / "Create floor
// plan" vs "Seat Setup Not Activated" / "Activate Seat Setup"; "No Services Setup
// Yet" / "Set up from Food and Drink" vs "Food & Drinks Not Activated"). Flagged.
test.describe('Activation gates @activation @publish @regression', () => {
  let eventId;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage({ storageState: '.auth/user.json' });
    const { id } = await createEvent(page);
    eventId = id;
    await page.close();
  });

  test('Seating tab shows the seat-setup empty state with a CTA @smoke', async ({ page }) => {
    await page.goto(`/events/${eventId}`, { waitUntil: 'load' });
    await page.getByRole('heading', { level: 1 }).waitFor({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Seating', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'No Seat Setup Yet' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create floor plan' })).toBeVisible();
  });

  test('Services tab shows the food & drinks empty state with a CTA', async ({ page }) => {
    await page.goto(`/events/${eventId}`, { waitUntil: 'load' });
    await page.getByRole('heading', { level: 1 }).waitFor({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Services', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'No Services Setup Yet' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Set up from Food and Drink' })).toHaveAttribute(
      'href',
      `/food-drinks/${eventId}`
    );
  });
});
