// Page Object for Seat Setup / Floor Plan editor (user-app: /seat-setup/<id>).
// Verified against the live -test DOM.

class SeatSetupPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.sidebar = this.main.getByRole('complementary');

    this.heading = page.getByRole('heading', { level: 1, name: 'Seat Setup' });
    this.backLink = page.getByRole('link', { name: 'Back to seat setup' });
    this.previewLink = page.getByRole('link', { name: 'Preview' });

    // Empty state
    this.emptyHeading = page.getByRole('heading', { level: 3, name: 'No Seat Setup Yet' });
    this.createFloorPlanButton = page.getByRole('button', { name: 'Create floor plan' });

    // Editor toolbar
    this.autoAssignButton = this.main.getByRole('button', { name: 'Auto-Assign', exact: true });
    this.addTableButton = this.main.getByRole('button', { name: 'Add Table' });
    this.addZoneButton = this.main.getByRole('button', { name: 'Add Zone' });
    this.stagePositionButton = this.main.getByRole('button', { name: 'Stage position' });
    this.doorPositionButton = this.main.getByRole('button', { name: 'Door position' });
    this.restroomPositionButton = this.main.getByRole('button', { name: 'Restroom position' });
    this.groupsFilter = this.main.getByRole('button', { name: 'Groups' });
    this.dietaryFilter = this.main.getByRole('button', { name: 'Dietary' });
    this.zoomInButton = this.main.getByRole('button', { name: 'Zoom in' });

    // Left panel
    this.unassignedHeading = this.sidebar.getByText('Unassigned Guests');
    this.guestSearch = this.sidebar.getByRole('searchbox');
    this.tablesLabel = this.sidebar.getByText('Tables', { exact: true });
    this.unassignedGuestCards = this.sidebar.locator('[aria-roledescription="draggable"]');

    // Canvas markers
    this.stageMarker = this.main.getByRole('img', { name: /Stage/ });
    this.doorMarker = this.main.getByRole('img', { name: /Door/ });
    this.restroomMarker = this.main.getByRole('img', { name: /Restroom/ });

    // New Zone modal
    this.zoneDialog = page.getByRole('dialog', { name: 'New Zone' });
    this.zoneNameInput = this.zoneDialog.getByRole('textbox', { name: 'Zone Name' });
    this.createZoneButton = this.zoneDialog.getByRole('button', { name: 'Create Zone' });
    this.cancelZoneButton = this.zoneDialog.getByRole('button', { name: 'Cancel' });

    // Add Table modal
    this.tableDialog = page.getByRole('dialog', { name: 'Add Table' });
    this.tableZoneSelect = this.tableDialog.getByRole('combobox');
    this.tableNumber = this.tableDialog.getByRole('spinbutton', { name: 'Table #' });
    this.tableCapacity = this.tableDialog.getByRole('spinbutton', { name: 'Capacity' });
    this.tableNameInput = this.tableDialog.getByRole('textbox', { name: 'Name (optional)' });
    this.addTableSubmit = this.tableDialog.getByRole('button', { name: 'Add Table' });
  }

  /** A position slot in an open Stage/Door/Restroom position menu. */
  positionOption(name) {
    return this.page.getByRole('menuitemradio', { name, exact: true });
  }

  /** A table-shape button inside the Add Table modal. */
  tableShape(name) {
    return this.tableDialog.getByRole('button', { name, exact: true });
  }

  /** Left-panel table rows (each shows "#n Name x/y"). */
  tableRow(text) {
    return this.sidebar.getByText(text);
  }

  async goto(eventId) {
    await this.page.goto(`/seat-setup/${eventId}`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await this.heading.waitFor({ timeout: 30_000 });
  }

  /** Open the editor (creates a floor plan if none exists yet). */
  async openEditor(eventId) {
    await this.goto(eventId);
    if (await this.createFloorPlanButton.count()) {
      await this.createFloorPlanButton.click();
      await this.addTableButton.waitFor({ timeout: 20_000 });
    }
  }
}

module.exports = { SeatSetupPage };
