// Page Object for the Floor Plan editor (user-app: /seat-setup/:id).
// Backs the Open Floor, Create Zone, Add Table, Drag Guest, and Edit/Delete Table
// stories. Locators + actions only — NO assertions. Verified against the live DOM.

class FloorPlanPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    // The floor editor's left panel — scoped to main to avoid matching the app's
    // global nav sidebar (also a `complementary`).
    this.sidebar = this.main.getByRole('complementary');

    this.heading = page.getByRole('heading', { level: 1, name: 'Seat Setup' });

    // --- Toolbar ---
    this.autoAssignButton = this.main.getByRole('button', { name: 'Auto-Assign', exact: true });
    this.addTableButton = this.main.getByRole('button', { name: 'Add Table' });
    this.moreTableOptionsButton = this.main.getByRole('button', { name: 'More table options' });
    this.addZoneButton = this.main.getByRole('button', { name: 'Add Zone' });
    this.doorPosition = this.main.getByRole('combobox', { name: 'Door position' });
    this.stagePosition = this.main.getByRole('combobox', { name: 'Stage position' });
    this.zoomInButton = this.main.getByRole('button', { name: 'Zoom in' });
    this.zoomOutButton = this.main.getByRole('button', { name: 'Zoom out' });

    // --- Filter tabs ---
    this.groupsFilter = this.main.getByRole('button', { name: 'Groups', exact: true });
    this.dietaryFilter = this.main.getByRole('button', { name: 'Dietary', exact: true });
    this.zoneServersFilter = this.main.getByRole('button', { name: 'Zone Servers' });

    // --- Left panel: unassigned guests + tables list ---
    this.unassignedHeading = this.sidebar.getByText('Unassigned Guests');
    this.guestSearch = this.sidebar.getByRole('searchbox');
    this.autoAssignAllButton = this.sidebar.getByRole('button', { name: 'Auto-Assign All' });
    this.tablesLabel = this.sidebar.getByText('Tables', { exact: true });
    this.unassignedGuestCards = this.sidebar.locator('[aria-roledescription="draggable"]');
    this.statusLegend = this.main.getByText('Status Legend');

    // --- Canvas objects ---
    this.canvasZones = this.main.getByRole('button', { name: /^Drag zone / });
    this.canvasTables = this.main.getByRole('button', { name: /^Drag table / });
    this.doorMarker = this.main.getByRole('img', { name: 'Door' });
    this.stageMarker = this.main.getByRole('img', { name: 'Stage' });
  }

  async goto(eventId) {
    await this.page.goto(`/seat-setup/${eventId}`, { waitUntil: 'load' });
    await this.addTableButton.waitFor({ timeout: 30_000 });
  }

  unassignedGuest(name) {
    return this.sidebar.getByRole('button', { name: new RegExp(name) });
  }

  canvasTable(n) {
    return this.main.getByRole('button', { name: `Drag table ${n}` });
  }
}

module.exports = { FloorPlanPage };
