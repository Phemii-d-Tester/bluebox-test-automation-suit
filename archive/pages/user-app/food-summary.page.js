// Page Object for the Food Summary (Single Event View → Services tab).
// Locators + actions only. Verified against the live DOM.

class FoodSummaryPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');

    this.servicesTab = page.getByRole('button', { name: 'Services', exact: true });

    this.foodMenuTab = this.main.getByRole('button', { name: 'Food Menu' });
    this.barDrinksTab = this.main.getByRole('button', { name: 'Bar & Drinks' });
    this.serviceRequestsTab = this.main.getByRole('button', { name: 'Service Requests' });
    this.setUpLink = this.main.getByRole('link', { name: 'Set up from Food and Drink' });

    this.table = this.main.getByRole('table');
    this.columnHeaders = this.table.getByRole('columnheader');
    this.dataRows = this.table.getByRole('row').filter({ has: page.getByRole('cell') });
  }

  async goto(eventId) {
    await this.page.goto(`/events/${eventId}`, { waitUntil: 'load' });
    await this.page.getByRole('heading', { level: 1 }).waitFor({ timeout: 30_000 });
    await this.servicesTab.click();
    await this.table.waitFor({ timeout: 15_000 });
  }

  itemRow(name) {
    return this.dataRows.filter({ hasText: name });
  }
}

module.exports = { FoodSummaryPage };
