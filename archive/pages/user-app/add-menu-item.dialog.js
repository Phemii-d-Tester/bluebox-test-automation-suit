// Page Object for the Add Menu Item modal (Menu Builder → Add Item).
// Locators + actions only. Verified against the live DOM.

class AddMenuItemDialog {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.dialog = page.getByRole('dialog', { name: 'Add Menu Item' });
    this.heading = this.dialog.getByRole('heading', { name: 'Add Menu Item' });

    this.uploadHint = this.dialog.getByText(/Max 5MB/);
    this.itemName = this.dialog.getByRole('textbox', { name: 'Item Name *' });
    this.description = this.dialog.getByRole('textbox', { name: 'Description' });
    this.course = this.dialog.getByRole('combobox');
    this.available = this.dialog.getByRole('switch');
    this.addButton = this.dialog.getByRole('button', { name: 'Add Item' });
    this.closeButton = this.dialog.getByRole('button', { name: 'Close' });
  }

  allergen(name) {
    return this.dialog.getByRole('checkbox', { name, exact: true });
  }

  dietaryTag(label) {
    return this.dialog.getByRole('button', { name: label });
  }

  async fill({ name, description } = {}) {
    if (name !== undefined) await this.itemName.fill(name);
    if (description !== undefined) await this.description.fill(description);
  }
}

module.exports = { AddMenuItemDialog };
