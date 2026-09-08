// Page Object for the Event detail page (user-app: /events/<id>).
// Tabs, activate/deactivate toggle, setup checklist, invite links.
// Verified against the live -test DOM.

class EventDetailPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');

    this.title = page.getByRole('heading', { level: 1 });
    this.editLink = page.getByRole('link', { name: 'Edit' });

    // Activation toggle labels: active = "Deactivate"; brand-new inactive = "Go
    // public"; previously-active-now-off = "Re-activate".
    this.deactivateButton = page.getByRole('button', { name: 'Deactivate', exact: true });
    this.activateButton = page.getByRole('button', { name: /^(Go public|Re-activate|Activate)$/ });

    // Tabs
    this.overviewTab = this.main.getByRole('button', { name: 'Overview' });
    this.guestsTab = this.main.getByRole('button', { name: 'Guests', exact: true });
    this.seatingTab = this.main.getByRole('button', { name: 'Seating', exact: true });

    this.setUpSeatingLink = page.getByRole('link', { name: 'Set up seating' });
    this.copyEventLink = page.getByRole('button', { name: 'Copy event link' });
  }

  async goto(eventId) {
    await this.page.goto(`/events/${eventId}`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await this.title.waitFor({ timeout: 30_000 });
  }

  /** True when the event is currently active (toggle reads "Deactivate"). */
  async isActive() {
    return (await this.deactivateButton.count()) > 0;
  }

  async openGuests() {
    await this.guestsTab.click();
    await this.page.waitForTimeout(1500);
  }
}

module.exports = { EventDetailPage };
