// Page Object for Create Event (user-app: /events/new) — single-page form.
// Verified against the live -test DOM. Date inputs = YYYY-MM-DD, time = HH:mm.

class CreateEventPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');

    this.heading = page.getByRole('heading', { level: 1, name: 'Create Event' });
    this.eventNameInput = page.getByRole('textbox', { name: 'Event Name' });
    this.startDate = page.getByRole('textbox', { name: 'Start date' });
    this.startTime = page.getByRole('textbox', { name: 'Start time' });
    this.endDate = page.getByRole('textbox', { name: 'End date' });
    this.endTime = page.getByRole('textbox', { name: 'End time' });
    this.timezone = page.getByRole('combobox', { name: 'Timezone' });
    this.descriptionInput = page.getByRole('textbox', { name: 'Add Description...' });
    this.venueNameInput = page.getByRole('textbox', { name: 'Enter venue name' });
    this.addressInput = page.getByRole('combobox', { name: /Search for a venue or enter address/ });
    this.capacityInput = this.main.getByRole('spinbutton');
    this.privateToggle = page.getByRole('switch', { name: 'Private event' });
    this.coverImageButton = page.getByRole('button', { name: /Cover Image/ });
    this.createButton = page.getByRole('button', { name: 'Create Event' });

    this.previewTitle = page.getByRole('heading', { level: 3 });
  }

  templateButton(name) {
    return this.page.getByRole('button', { name, exact: true });
  }

  async goto() {
    await this.page.goto('/events/new', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await this.createButton.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(500);
  }

  async selectTemplate(name) {
    await this.templateButton(name).click();
  }

  async fill({ name, startDate, startTime, endDate, endTime, description, venueName, location, capacity } = {}) {
    if (name !== undefined) await this.eventNameInput.fill(name);
    if (startDate !== undefined) await this.startDate.fill(startDate);
    if (startTime !== undefined) await this.startTime.fill(startTime);
    if (endDate !== undefined) await this.endDate.fill(endDate);
    if (endTime !== undefined) await this.endTime.fill(endTime);
    if (description !== undefined) await this.descriptionInput.fill(description);
    if (venueName !== undefined) await this.venueNameInput.fill(venueName);
    // Location is REQUIRED. The field accepts free text (autocomplete optional).
    if (location !== undefined) await this.addressInput.fill(location);
    if (capacity !== undefined) await this.capacityInput.fill(String(capacity));
  }

  async submit() {
    await this.createButton.click();
  }
}

module.exports = { CreateEventPage };
