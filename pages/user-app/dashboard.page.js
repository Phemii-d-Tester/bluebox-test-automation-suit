// Page Object for the planner Dashboard (user-app: /home).
// Verified against the live -test DOM.

class DashboardPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');

    // Sidebar
    this.navDashboard = page.getByRole('link', { name: 'Dashboard' });
    this.navEvents = page.getByRole('link', { name: 'Events' });
    this.navSeatSetup = page.getByRole('link', { name: 'Seat Setup' });
    this.logoutButton = page.getByRole('button', { name: 'Log out' });
    this.notifications = page.getByRole('button', { name: 'Notifications' });

    // Main
    this.welcomeHeading = page.getByRole('heading', { level: 1, name: /^Welcome,/ });
    this.yourEventsHeading = page.getByRole('heading', { level: 2, name: 'Your Events' });
    // Two "View All"/"View all" links both point at /events.
    this.viewAll = page.getByRole('link', { name: /^View all$/i }).first();
    this.eventCards = this.main.getByRole('link', { name: /^Open / });

    // Stat tiles ("Upcoming" also appears as an event-card status → scope to first).
    this.totalEventsStat = this.main.getByText('Total Events', { exact: true });
    this.totalGuestsStat = this.main.getByText('Total Guests', { exact: true });
    this.avgAttendanceStat = this.main.getByText('Avg. Attendance', { exact: true });
    this.upcomingStat = this.main.getByText('Upcoming', { exact: true }).first();

    // Recent Activity
    this.recentActivityHeading = this.main.getByRole('heading', { name: /Recent Activity/i });
    this.recentActivityList = this.main.getByRole('list').last();
  }

  /** Numeric value shown for a stat label (the value paragraph precedes the label). */
  statValue(label) {
    return this.main
      .getByText(label, { exact: true })
      .first()
      .locator('xpath=preceding-sibling::*[1]');
  }

  async goto() {
    await this.page.goto('/home', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await this.welcomeHeading.waitFor({ timeout: 30_000 });
  }
}

module.exports = { DashboardPage };
