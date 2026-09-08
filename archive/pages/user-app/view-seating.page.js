// Page Object for the View Seating overview (user-app: /seat-setup).
// Locators + actions only — NO assertions. Verified against the live DOM.

class ViewSeatingPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');

    this.heading = page.getByRole('heading', { level: 1, name: 'Seat Setup' });

    // --- Summary stats (plain paragraphs, not cards) ---
    this.eventsWithSeatingStat = this.main.getByText('Events with seating');
    this.seatsMappedStat = this.main.getByText('Seats mapped');
    this.sectionsDefinedStat = this.main.getByText('Sections defined');

    // --- Tabs ---
    this.tabAll = page.getByRole('button', { name: 'All', exact: true });
    this.tabLive = page.getByRole('button', { name: 'Live', exact: true });
    this.tabUpcoming = page.getByRole('button', { name: 'Upcoming', exact: true });
    this.tabDraft = page.getByRole('button', { name: 'Draft', exact: true });

    this.searchInput = this.main.getByRole('searchbox');

    // --- Event rows ---
    this.eventCards = this.main.getByRole('article');
  }

  async goto() {
    await this.page.goto('/seat-setup', { waitUntil: 'load' });
    await this.heading.waitFor({ timeout: 30_000 });
  }

  eventCardByName(name) {
    return this.eventCards.filter({ has: this.page.getByRole('heading', { level: 2, name }) });
  }

  async search(term) {
    await this.searchInput.fill(term);
  }
}

module.exports = { ViewSeatingPage };
