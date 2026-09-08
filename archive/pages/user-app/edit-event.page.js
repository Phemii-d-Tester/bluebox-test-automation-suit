// Page Object for the Edit Event wizard (user-app: /events/:id/edit).
// Same 3-step wizard as Create, pre-filled with the event's data, but the final
// action is "Save Changes" and the cover image offers Replace/Remove.
// Extends CreateEventPage to reuse the identical field locators + step actions.

const { CreateEventPage } = require('./create-event.page');

class EditEventPage extends CreateEventPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Edit Event' });
    this.saveButton = page.getByRole('button', { name: 'Save Changes' });
    this.replaceImageButton = page.getByRole('button', { name: 'Replace' });
    this.removeImageButton = page.getByRole('button', { name: 'Remove image' });
  }

  async goto(id) {
    await this.page.goto(`/events/${id}/edit`, { waitUntil: 'load' });
    await this.eventNameInput.waitFor({ timeout: 30_000 });
  }

  async save() {
    await this.saveButton.click();
  }
}

module.exports = { EditEventPage };
