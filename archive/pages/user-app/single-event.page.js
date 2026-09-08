// Page Object for the Single Event View (user-app: /events/:id).
// Locators + actions only — NO assertions (those live in specs).
// Verified against the live authenticated DOM via Playwright ARIA snapshot.

class SingleEventPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');

    // --- Header ---
    this.backLink = this.main.getByRole('link', { name: 'Back' });
    this.title = this.main.getByRole('heading', { level: 1 });
    this.statusBadge = this.main.getByText(/^(Draft|Upcoming|Live|Past|Completed)$/).first();
    this.editLink = this.main.getByRole('link', { name: 'Edit' });
    this.shareQrButton = page.getByRole('button', { name: 'Share QR' });

    // --- Tabs ---
    this.tabOverview = page.getByRole('button', { name: 'Overview', exact: true });
    this.tabGuests = page.getByRole('button', { name: 'Guests', exact: true });
    this.tabSeating = page.getByRole('button', { name: 'Seating', exact: true });
    this.tabServices = page.getByRole('button', { name: 'Services', exact: true });
    this.tabAnalytics = page.getByRole('button', { name: 'Analytics', exact: true });

    // --- Overview: summary stats (exact label distinguishes from module cards) ---
    this.confirmedStat = this.statByLabel('Confirmed');
    this.checkedInStat = this.statByLabel('Checked In');
    this.ordersStat = this.statByLabel('Orders');

    // --- Overview: module cards ---
    this.seatingModuleCard = this.main.getByRole('article').filter({ hasText: 'Find Your Seat' });
    this.foodModuleCard = this.main.getByRole('article').filter({ hasText: 'Food & Drinks' });
    this.openModuleLink = this.main.getByRole('link', { name: 'Open Module' });

    // --- Overview: QR codes & links ---
    this.qrHeading = page.getByRole('heading', { name: 'QR Codes & Links' });
    this.inviteUrl = this.main.getByText(/\/invite\/[a-z0-9]+/i);

    // --- Overview: other sections ---
    this.timelineHeading = page.getByRole('heading', { name: 'Event Timeline' });
    this.myRolesHeading = page.getByRole('heading', { name: 'My Roles' });
    this.currentRole = this.main.getByText(/You are currently:/);
    this.inviteCollabHeading = page.getByRole('heading', { name: 'Invite Collaborator' });
    this.inviteEmailInput = page.getByPlaceholder('colleague@company.com');
    this.inviteButton = page.getByRole('button', { name: 'Invite', exact: true });

    // --- Seating tab ---
    this.floorPlanHeading = page.getByRole('heading', { name: /Floor Plan/ });
  }

  statByLabel(label) {
    return this.main.getByRole('article').filter({ has: this.page.getByText(label, { exact: true }) });
  }

  async goto(id) {
    await this.page.goto(`/events/${id}`, { waitUntil: 'load' });
    await this.title.waitFor({ timeout: 30_000 });
  }
}

module.exports = { SingleEventPage };
