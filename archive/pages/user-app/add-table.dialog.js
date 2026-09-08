// Page Object for the Add Table modal (floor editor → Add Table).
// Locators + actions only. Verified against the live DOM.

class AddTableDialog {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.dialog = page.getByRole('dialog', { name: 'Add Table' });
    this.heading = this.dialog.getByRole('heading', { name: 'Add Table' });
    this.zoneSelect = this.dialog.getByRole('combobox');
    this.tableNumber = this.dialog.getByRole('spinbutton', { name: 'Table #' });
    this.capacity = this.dialog.getByRole('spinbutton', { name: 'Capacity' });
    this.name = this.dialog.getByRole('textbox', { name: 'Name (optional)' });
    this.shapeRound = this.dialog.getByRole('button', { name: 'Round' });
    this.shapeRectangle = this.dialog.getByRole('button', { name: 'Rectangle' });
    this.shapeSquare = this.dialog.getByRole('button', { name: 'Square' });
    this.shapeOval = this.dialog.getByRole('button', { name: 'Oval' });
    this.submitButton = this.dialog.getByRole('button', { name: 'Add Table' });
    this.closeButton = this.dialog.getByRole('button', { name: 'Close' });
  }

  async add({ capacity, name } = {}) {
    if (capacity !== undefined) await this.capacity.fill(String(capacity));
    if (name !== undefined) await this.name.fill(name);
    await this.submitButton.click();
  }
}

module.exports = { AddTableDialog };
