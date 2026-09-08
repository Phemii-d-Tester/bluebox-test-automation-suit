const { test, expect } = require('@playwright/test');
const { EditEventPage } = require('../../pages/user-app/edit-event.page');
const { CreateEventPage } = require('../../pages/user-app/create-event.page');
const { SEEDED_EVENTS } = require('../../data/seededEvents');
const { futureDate } = require('../../utils/dates');
const { uniqueSuffix } = require('../../utils/generators');

const EVENT = SEEDED_EVENTS.birthdayParty;

test.describe('Edit Event @edit-event @regression', () => {
  // Read-only checks against the seeded event — these never click Save, so the
  // seeded data (relied on by other specs) is left untouched.
  test.describe('Pre-filled form (no save)', () => {
    let edit;

    test.beforeEach(async ({ page }) => {
      edit = new EditEventPage(page);
      await edit.goto(EVENT.id);
    });

    test('should open the wizard pre-filled with the event details @smoke', async () => {
      await expect(edit.heading).toBeVisible();
      await expect(edit.eventNameInput).toHaveValue(EVENT.name);
      await expect(edit.descriptionInput).not.toHaveValue('');
    });

    test('should offer Replace / Remove for the existing cover image', async () => {
      await expect(edit.replaceImageButton).toBeVisible();
      await expect(edit.removeImageButton).toBeVisible();
    });

    test('should disable Continue when the event name is cleared', async () => {
      await expect(edit.continueButton).toBeEnabled();
      await edit.eventNameInput.fill('');
      await expect(edit.continueButton).toBeDisabled();
      await edit.eventNameInput.fill(EVENT.name);
      await expect(edit.continueButton).toBeEnabled();
    });

    test('should carry pre-filled venue, capacity and date into Step 2', async () => {
      await edit.continue();
      await expect(edit.stepIndicator(2)).toBeVisible();
      await expect(edit.venueNameInput).toHaveValue(EVENT.venue);
      await expect(edit.guestCapacityInput).toHaveValue('200');
      await expect(edit.dateInput).toHaveValue('2026-08-14');
    });

    test('should reach a Review step offering Save Changes', async () => {
      await edit.continue();
      await expect(edit.stepIndicator(2)).toBeVisible();
      await edit.continue();
      await expect(edit.stepIndicator(3)).toBeVisible();
      await expect(edit.saveButton).toBeVisible(); // review-step marker in edit mode
      await expect(edit.main).toContainText(EVENT.name);
      await expect(edit.main).toContainText(EVENT.venue);
    });

    test('should preserve a changed name when navigating Back', async () => {
      const changed = `Birthday Party ${uniqueSuffix()}`;
      await edit.eventNameInput.fill(changed);
      await edit.continue();
      await expect(edit.stepIndicator(2)).toBeVisible();
      await edit.back();
      await expect(edit.stepIndicator(1)).toBeVisible();
      await expect(edit.eventNameInput).toHaveValue(changed);
    });
  });

  // @publish is DESTRUCTIVE: it persists an edit. To avoid mutating shared seeded
  // data it creates its OWN throwaway event first, then edits that. Excluded from
  // default runs (run via `npm run test:publish`).
  test.describe('Persisting an edit', () => {
    test('should save an edited name and reflect it on the event view @publish', async ({ page }) => {
      // 1) Create a throwaway event and grab its id from the API response.
      const wizard = new CreateEventPage(page);
      await wizard.goto();
      await wizard.selectTemplate('Conferences');
      await wizard.fillStep1({ name: `Edit Target ${uniqueSuffix()}` });
      await wizard.continue();
      await wizard.fillStep2({ date: futureDate(30), startTime: '09:00', endTime: '17:00' });
      await wizard.continue();
      const [createResp] = await Promise.all([
        page.waitForResponse(
          (r) => r.request().method() === 'POST' && /\/events$/.test(r.url().split('?')[0]) && r.status() < 400,
          { timeout: 30_000 }
        ),
        wizard.publish(),
      ]);
      const id = (await createResp.json().catch(() => null))?.data?.id;
      expect(id, 'created event id').toBeTruthy();

      // 2) Edit it: change the name and save.
      const newName = `Edited Event ${uniqueSuffix()}`;
      const edit = new EditEventPage(page);
      await edit.goto(id);
      await edit.eventNameInput.fill(newName);
      await edit.continue();
      await edit.continue();
      await expect(edit.saveButton).toBeVisible();
      await edit.save();

      // 3) The change is persisted and shown on the single-event view.
      await expect(page.getByRole('heading', { level: 1, name: newName })).toBeVisible({ timeout: 30_000 });

      // Best-effort cleanup (planner role cannot delete -> 403, logged for manual cleanup).
      const del = await page.request.delete(`${createResp.url().split('?')[0]}/${id}`, {
        headers: { authorization: createResp.request().headers()['authorization'] || '' },
      });
      if (!del.ok()) {
        console.warn(`[cleanup] Event ${id} ("${newName}") persists — DELETE ${del.status()}. Manual cleanup required.`);
      }
    });
  });
});
