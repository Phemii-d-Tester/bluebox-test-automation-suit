// Page Object for the New Zone modal (floor editor → Add Zone).
// Locators + actions only. Verified against the live DOM.

class AddZoneDialog {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.dialog = page.getByRole('dialog', { name: 'New Zone' });
    this.heading = this.dialog.getByRole('heading', { name: 'New Zone' });
    this.zoneName = this.dialog.getByRole('textbox', { name: 'Zone Name' });
    this.colourSwatches = this.dialog.getByRole('button', { name: /^Colour #/ });
    this.createButton = this.dialog.getByRole('button', { name: 'Create Zone' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.closeButton = this.dialog.getByRole('button', { name: 'Close' });
  }

  colour(hex) {
    return this.dialog.getByRole('button', { name: `Colour ${hex}` });
  }

  async create({ name, hex } = {}) {
    if (name !== undefined) await this.zoneName.fill(name);
    if (hex !== undefined) await this.colour(hex).click();
    await this.createButton.click();
  }
}

module.exports = { AddZoneDialog };
