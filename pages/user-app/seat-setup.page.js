// Page Object for the Seating layout editor (user-app: /seat-setup/<id>).
// The editor was redesigned into a TEMPLATE-based layout tool: pick a layout
// template (Banquet / Wedding / Conference), place Stage / Door / Restroom via
// position menus, assign a seating category per table, then Save layout.
// Verified against the live -test DOM.

class SeatSetupPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.sidebar = this.main.getByRole('complementary');

    this.heading = page.getByRole('heading', { level: 1, name: 'Seating layout' });
    this.backToEventLink = page.getByRole('link', { name: /Back to Event/ });

    // Element placement — each opens a position menu of menuitemradio slots.
    this.stagePositionButton = this.main.getByRole('button', { name: 'Stage position' });
    this.doorPositionButton = this.main.getByRole('button', { name: 'Door position' });
    this.restroomPositionButton = this.main.getByRole('button', { name: 'Restroom position' });

    this.previewButton = this.main.getByRole('button', { name: 'Preview' });
    this.saveLayoutButton = this.main.getByRole('button', { name: 'Save layout' });

    // Templates panel (left)
    this.templatesHeading = this.sidebar.getByRole('heading', { name: 'Templates' });

    // Per-table category assignment (one "Assign Category" per table in the template).
    this.assignCategoryButtons = this.main.getByRole('button', { name: 'Assign Category' });

    // Canvas controls
    this.fitToScreenButton = this.main.getByRole('button', { name: 'Fit to screen' });
    this.undoButton = this.main.getByRole('button', { name: 'Undo' });
    this.redoButton = this.main.getByRole('button', { name: 'Redo' });
    this.snapToGridSwitch = this.main.getByRole('switch');

    // Canvas markers (appear once a template / positions are applied)
    this.stageMarker = this.main.getByText('Stage', { exact: true });
    this.doorMarker = this.main.getByText('Main Door', { exact: true });
  }

  /** A slot in an open Stage/Door/Restroom position menu. */
  positionOption(name) {
    return this.page.getByRole('menuitemradio', { name, exact: true });
  }

  /** A layout template button in the left panel (matched by its label text). */
  templateButton(name) {
    return this.sidebar.getByRole('button', { name: new RegExp(name) });
  }

  async goto(eventId) {
    await this.page.goto(`/seat-setup/${eventId}`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await this.heading.waitFor({ timeout: 30_000 });
  }

  async selectTemplate(name) {
    await this.templateButton(name).click();
    await this.page.waitForTimeout(1500);
  }

  /** Open a position menu and choose a slot. */
  async placeElement(button, slot) {
    await button.click();
    await this.positionOption(slot).click();
    await this.page.waitForTimeout(600);
  }
}

module.exports = { SeatSetupPage };
