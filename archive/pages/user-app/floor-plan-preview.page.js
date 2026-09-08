// Page Object for the Floor Plan preview (Single Event View → Seating tab).
// Read-only preview; "Open Seat Setup" leads to the editor. Verified against DOM.

class FloorPlanPreviewPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');

    this.seatingTab = page.getByRole('button', { name: 'Seating', exact: true });

    this.totalSeatsStat = this.main.getByRole('article').filter({ has: page.getByText('Total Seats', { exact: true }) });
    this.assignedStat = this.main.getByRole('article').filter({ has: page.getByText('Assigned', { exact: true }) });
    this.availableStat = this.main.getByRole('article').filter({ has: page.getByText('Available', { exact: true }) });

    this.floorPlanHeading = page.getByRole('heading', { name: /— Floor Plan/ });
    this.floorPlanCard = this.main.getByRole('article').filter({ has: this.floorPlanHeading });
    this.openSeatSetupLink = this.main.getByRole('link', { name: 'Open Seat Setup' });
  }

  async goto(eventId) {
    await this.page.goto(`/events/${eventId}`, { waitUntil: 'load' });
    await this.page.getByRole('heading', { level: 1 }).waitFor({ timeout: 30_000 });
    await this.seatingTab.click();
    await this.floorPlanHeading.waitFor({ timeout: 15_000 });
  }
}

module.exports = { FloorPlanPreviewPage };
