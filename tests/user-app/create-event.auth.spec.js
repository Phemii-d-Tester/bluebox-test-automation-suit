const { test, expect } = require('@playwright/test');
const { CreateEventPage } = require('../../pages/user-app/create-event.page');
const { futureDate } = require('../../utils/dates');
const { uniqueSuffix } = require('../../utils/generators');

const TEMPLATES = ['Conferences', 'Galas & Dinners', 'Workshops', 'Weddings', 'Parties', 'Others'];

test.describe('Create Event @create-event @regression', () => {
  let wizard;

  test.beforeEach(async ({ page }) => {
    wizard = new CreateEventPage(page);
    await wizard.goto();
  });

  test('should show the create-event form with all fields @smoke', async () => {
    await expect(wizard.heading).toBeVisible();
    for (const t of TEMPLATES) await expect(wizard.templateButton(t)).toBeVisible();
    await expect(wizard.eventNameInput).toBeVisible();
    await expect(wizard.startDate).toBeVisible();
    await expect(wizard.endDate).toBeVisible();
    await expect(wizard.timezone).toBeVisible();
    await expect(wizard.venueNameInput).toBeVisible();
    await expect(wizard.capacityInput).toBeVisible();
    await expect(wizard.createButton).toBeVisible();
  });

  test('should prefill schedule and capacity from a template', async () => {
    await wizard.selectTemplate('Conferences');
    await expect(wizard.startDate).not.toHaveValue('');
    await expect(wizard.startTime).not.toHaveValue('');
    await expect(wizard.capacityInput).not.toHaveValue('');
  });

  test('should update the live preview as the name is typed', async () => {
    await wizard.fill({ name: 'QA Preview Event' });
    await expect(wizard.previewTitle).toHaveText('QA Preview Event');
  });

  test('should require a Location before creating', async ({ page }) => {
    await wizard.fill({
      name: 'QA No Location',
      startDate: futureDate(30), startTime: '09:00', endDate: futureDate(30), endTime: '17:00',
      venueName: 'QA Hall',
    });
    await wizard.submit();
    await expect(page).toHaveURL(/\/events\/new/); // blocked — stays on the form
    await expect(page.getByText('Location is required')).toBeVisible();
  });

  // @publish creates a real event (persists). Excluded from default runs.
  test('should create an event and open its event page @publish', async ({ page }) => {
    const name = `QA Event ${uniqueSuffix()}`;
    await wizard.fill({
      name,
      startDate: futureDate(30),
      startTime: '09:00',
      endDate: futureDate(30),
      endTime: '17:00',
      venueName: 'QA Test Hall',
      location: '24 Test Avenue, Ikeja, Lagos',
      capacity: 120,
    });
    await wizard.submit();
    // Lands on the new event's detail page.
    await expect(page).not.toHaveURL(/\/events\/new/, { timeout: 30_000 });
    await expect(page.getByRole('heading', { level: 1, name })).toBeVisible({ timeout: 30_000 });
  });
});
