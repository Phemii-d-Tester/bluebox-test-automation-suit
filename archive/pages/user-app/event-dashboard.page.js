// Page Object for the Event Dashboard / events list (user-app: /events).
// Locators + actions only — NO assertions (those live in specs).
// Verified against the live authenticated DOM via Playwright ARIA snapshot.

class EventDashboardPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');

    this.heading = page.getByRole('heading', { level: 1, name: 'Events' });
    // Scoped to main — the sidebar also has a "Create Event" link.
    this.createEventLink = this.main.getByRole('link', { name: 'Create Event', exact: true });
    this.createNewEventCard = page.getByRole('link', { name: /Create New Event/ });

    // --- Summary stats (each is an article with a number + label) ---
    this.totalEventsStat = this.main.getByRole('article').filter({ hasText: 'Total Events' });
    this.liveNowStat = this.main.getByRole('article').filter({ hasText: 'Live Now' });
    this.upcomingStat = this.main.getByRole('article').filter({ hasText: 'Upcoming' });
    this.pastStat = this.main.getByRole('article').filter({ hasText: 'Past' });

    // --- Filter tabs (labels carry counts, e.g. "Upcoming(6)") ---
    this.tabAll = page.getByRole('button', { name: /^All/ });
    this.tabLive = page.getByRole('button', { name: /^Live/ });
    this.tabUpcoming = page.getByRole('button', { name: /^Upcoming/ });
    this.tabPast = page.getByRole('button', { name: /^Past/ });
    this.tabDraft = page.getByRole('button', { name: /^Draft/ });

    // --- Search + sort ---
    this.searchInput = page.getByPlaceholder('Search events...');
    this.sortSelect = this.main.getByRole('combobox');

    // --- Event cards: articles that contain an h3 (excludes the stat tiles) ---
    this.eventCards = this.main.getByRole('article').filter({ has: page.getByRole('heading', { level: 3 }) });
  }

  async goto() {
    await this.page.goto('/events', { waitUntil: 'load' });
    await this.heading.waitFor({ timeout: 30_000 });
  }

  eventCardByName(name) {
    return this.eventCards.filter({ has: this.page.getByRole('heading', { level: 3, name }) });
  }

  cardTitle(card) {
    return card.getByRole('heading', { level: 3 });
  }

  async search(term) {
    await this.searchInput.fill(term);
  }

  async sortBy(label) {
    await this.sortSelect.click();
    await this.page.getByRole('option', { name: label }).click();
  }

  async openEvent(name) {
    await this.eventCardByName(name).getByRole('link', { name: /Open/ }).click();
  }
}

module.exports = { EventDashboardPage };
