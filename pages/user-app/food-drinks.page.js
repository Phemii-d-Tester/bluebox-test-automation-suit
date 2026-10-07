// Page Object for the Food & Drink / Kitchen module (user-app).
// Covers four surfaces:
//   1. Global dashboard   — /food-drinks   (roll-up stats + empty state)
//   2. Global kitchen      — /kitchen        (event picker → staff board)
//   3. Event F&D tab       — /events/<id> → "Food & Drinks" tab
//                            (Open-menu switch, Menu/Orders/Requests/Dietary
//                             sub-tabs, menu editor, Kitchen View link)
//   4. Staff kitchen board — /staff/<token>  (live KDS: Pending/Preparing/Ready/Served)
// Locators + actions only — assertions live in specs. Verified against the live
// -test DOM via Playwright ARIA snapshots.

class FoodDrinksPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');

    // --- 1. Global /food-drinks dashboard ---
    this.dashboardHeading = page.getByRole('heading', { level: 1, name: 'Food & Drinks' });
    this.menuItemsStat = this.main.getByText('Menu items', { exact: true });
    this.activeOrdersStat = this.main.getByText('Active orders', { exact: true });
    this.pendingRequestsStat = this.main.getByText('Pending requests', { exact: true });
    this.allergyAlertsStat = this.main.getByText('Allergy alerts', { exact: true });
    this.createEventLink = this.main.getByRole('link', { name: 'Create Event' });
    this.goToEventsLink = this.main.getByRole('link', { name: 'Go to Events' });
    this.noActiveHeading = page.getByRole('heading', { name: /No Active Food & Drinks/i });

    // --- 2. Global /kitchen event picker ---
    this.kitchenHeading = page.getByRole('heading', { level: 1, name: 'Kitchen' });

    // --- 3. Event Food & Drinks tab ---
    // Event-detail tab strip (buttons, not ARIA tabs).
    this.foodDrinksTab = this.main.getByRole('button', { name: 'Food & Drinks', exact: true });
    this.openMenuSwitch = page.getByRole('switch', { name: 'Open menu' });
    this.raiseHandSwitch = page.getByRole('switch', { name: 'Toggle raise hand' });
    this.kitchenViewLink = page.getByRole('link', { name: 'Kitchen View' });
    // Sub-tabs carry a live count suffix, e.g. "Menu · 0" / "Orders · 2".
    this.menuSubTab = this.main.getByRole('button', { name: /^Menu ·/ });
    this.ordersSubTab = this.main.getByRole('button', { name: /^Orders ·/ });
    this.requestsSubTab = this.main.getByRole('button', { name: /^Requests ·/ });
    this.dietarySubTab = this.main.getByRole('button', { name: 'Dietary', exact: true });
    // Menu editor (Menu sub-tab)
    this.addCategoryButton = this.main.getByRole('button', { name: 'Add Category' });
    this.addFromSamplesButton = this.main.getByRole('button', { name: 'Add from samples' });
    this.categoryNameInput = this.main.getByRole('textbox', { name: /Category name/ });
    this.categoryAddButton = this.main.getByRole('button', { name: 'Add', exact: true });
    this.categoryCancelButton = this.main.getByRole('button', { name: 'Cancel', exact: true });
    this.menuPreview = this.main.getByText('Menu Preview');
    // Orders / Requests sub-tabs (shared toolbar shape)
    this.exportCsvButton = this.main.getByRole('button', { name: 'Export CSV' });
    this.ordersSearch = this.main.getByRole('textbox', { name: 'Search orders...' });
    this.requestsSearch = this.main.getByRole('textbox', { name: 'Search requests...' });
    this.previousPageButton = this.main.getByRole('button', { name: 'Previous' });
    this.nextPageButton = this.main.getByRole('button', { name: 'Next' });

    // --- 4. Staff kitchen board (/staff/<token>) ---
    this.allergyOnlyButton = this.main.getByRole('button', { name: 'Allergy Only' });
    this.byStatusButton = this.main.getByRole('button', { name: 'By Status' });
    this.byTableButton = this.main.getByRole('button', { name: 'By Table' });
    this.boardSearch = this.main.getByRole('searchbox', { name: 'Search...' });
  }

  // ----- navigation -----

  async gotoDashboard() {
    await this.page.goto('/food-drinks', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await this.dashboardHeading.waitFor({ timeout: 30_000 });
  }

  async gotoKitchenPicker() {
    await this.page.goto('/kitchen', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await this.kitchenHeading.waitFor({ timeout: 30_000 });
    // Picker cards render outside the <main> landmark and load after the heading on
    // a cold start — wait for the first one (each card carries an "ACCEPTED" badge).
    await this.page.getByRole('button', { name: /ACCEPTED/ }).first().waitFor({ timeout: 20_000 }).catch(() => {});
  }

  /** Open an event and switch to its Food & Drinks tab. */
  async gotoEventFoodDrinks(eventId) {
    await this.page.goto(`/events/${eventId}`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await this.foodDrinksTab.waitFor({ timeout: 30_000 });
    await this.foodDrinksTab.click();
    // Menu sub-tab + Add Category confirm the F&D panel mounted.
    await this.addCategoryButton.or(this.menuSubTab).first().waitFor({ timeout: 20_000 });
  }

  async gotoStaffBoard(token) {
    await this.page.goto(`/staff/${token}`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  }

  // ----- helpers -----

  /** A kitchen-picker event card (button) matched by event name. The "ACCEPTED"
   * qualifier distinguishes the picker card from the sidebar event-switcher button
   * of the same name, and the card sits outside the <main> landmark. */
  kitchenEventCard(name) {
    return this.page.getByRole('button', { name: new RegExp(`${name}[\\s\\S]*ACCEPTED`) });
  }

  /** A column-count tile on the staff board / orders tab by status label. */
  columnCount(label) {
    return this.main
      .getByText(label, { exact: true })
      .first()
      .locator('xpath=preceding-sibling::*[1]');
  }

  async openSubTab(name) {
    const map = {
      Menu: this.menuSubTab,
      Orders: this.ordersSubTab,
      Requests: this.requestsSubTab,
      Dietary: this.dietarySubTab,
    };
    await map[name].click();
    await this.page.waitForTimeout(1200);
  }

  /** Reveal the inline "Add Category" editor and optionally type a name. */
  async startAddCategory(name) {
    await this.addCategoryButton.click();
    await this.categoryNameInput.waitFor({ timeout: 10_000 });
    if (name !== undefined) await this.categoryNameInput.fill(name);
  }
}

module.exports = { FoodDrinksPage };
