const { test, expect } = require('@playwright/test');
const { FoodDrinksPage } = require('../../pages/user-app/food-drinks.page');
const { FIXTURES } = require('../../data/testFixtures');
const { uniqueSuffix } = require('../../utils/generators');

// Food & Drink / Kitchen module. Exercises the global dashboard, the kitchen
// event picker, the event-level Food & Drinks tab (menu editor + Orders /
// Requests / Dietary sub-tabs) and the live staff kitchen board.
//
// Read-only / structural checks run by default. @publish tests mutate the
// disposable fixture event (create a menu category) and are excluded by default.
test.describe('Food & Drinks @food-drinks @regression', () => {
  const eventId = FIXTURES.foodDrinksEvent.id;
  const token = FIXTURES.foodDrinksEvent.token;

  test.describe('Global dashboard (/food-drinks)', () => {
    let fd;
    test.beforeEach(async ({ page }) => {
      fd = new FoodDrinksPage(page);
      await fd.gotoDashboard();
    });

    test('should show the heading and the four roll-up stats @smoke', async () => {
      await expect(fd.dashboardHeading).toBeVisible();
      await expect(fd.menuItemsStat).toBeVisible();
      await expect(fd.activeOrdersStat).toBeVisible();
      await expect(fd.pendingRequestsStat).toBeVisible();
      await expect(fd.allergyAlertsStat).toBeVisible();
    });

    test('should render the empty state until an event activates food & drinks', async ({ page }) => {
      // The module roll-up is empty until a planner activates F&D on an event.
      // When nothing is active the page guides the user back to Events.
      const hasEmptyState = (await fd.noActiveHeading.count()) > 0;
      test.skip(!hasEmptyState, 'An event already has food & drinks active — skipping empty-state check.');
      await expect(fd.noActiveHeading).toBeVisible();
      await expect(fd.goToEventsLink).toHaveAttribute('href', '/events');
    });
  });

  test.describe('Kitchen picker (/kitchen)', () => {
    let fd;
    test.beforeEach(async ({ page }) => {
      fd = new FoodDrinksPage(page);
      await fd.gotoKitchenPicker();
    });

    test('should list events to open the live order board @smoke', async () => {
      await expect(fd.kitchenHeading).toBeVisible();
      await expect(fd.kitchenEventCard(FIXTURES.foodDrinksEvent.name).first()).toBeVisible();
    });

    test('should open an event board from a picker card', async ({ page }) => {
      await fd.kitchenEventCard(FIXTURES.foodDrinksEvent.name).first().click();
      // Selecting an event navigates to that event's staff board.
      await expect(page).toHaveURL(/\/staff\/[a-z0-9]+/i, { timeout: 20_000 });
    });
  });

  test.describe('Event Food & Drinks tab', () => {
    let fd;
    test.beforeEach(async ({ page }) => {
      fd = new FoodDrinksPage(page);
      await fd.gotoEventFoodDrinks(eventId);
    });

    test('should expose the menu editor, sub-tabs and kitchen view @smoke', async () => {
      await expect(fd.menuSubTab).toBeVisible();
      await expect(fd.ordersSubTab).toBeVisible();
      await expect(fd.requestsSubTab).toBeVisible();
      await expect(fd.dietarySubTab).toBeVisible();
      await expect(fd.addCategoryButton).toBeVisible();
      await expect(fd.addFromSamplesButton).toBeVisible();
      await expect(fd.openMenuSwitch).toBeVisible();
      // Kitchen View opens the token-scoped staff board.
      await expect(fd.kitchenViewLink).toHaveAttribute('href', /\/staff\/[a-z0-9]+/i);
    });

    test('should open the inline Add Category editor and gate Add on a name', async () => {
      await fd.startAddCategory(); // reveal the editor, no name yet
      await expect(fd.categoryNameInput).toBeVisible();
      await expect(fd.categoryAddButton).toBeDisabled();
      await fd.categoryNameInput.fill(`Cat ${uniqueSuffix()}`);
      await expect(fd.categoryAddButton).toBeEnabled();
      await fd.categoryCancelButton.click();
      await expect(fd.categoryNameInput).toBeHidden();
    });

    test('should show the Orders board toolbar', async () => {
      await fd.openSubTab('Orders');
      await expect(fd.ordersSearch).toBeVisible();
      await expect(fd.exportCsvButton).toBeVisible();
      // Four kitchen states are tracked.
      for (const label of ['Pending', 'Preparing', 'Ready', 'Served']) {
        await expect(fd.main.getByText(label, { exact: true }).first()).toBeVisible();
      }
    });

    test('should show the Requests board with a live raise-hand toggle', async () => {
      await fd.openSubTab('Requests');
      await expect(fd.raiseHandSwitch).toBeVisible();
      await expect(fd.requestsSearch).toBeVisible();
    });

    // @publish creates a menu category on the disposable fixture event. A created
    // category has no automated delete affordance, so this is opt-in (excluded by
    // default) and leaves the category behind, like the guest @publish test.
    test('should create a menu category that appears in the menu @publish', async ({ page }) => {
      const name = `QA Cat ${uniqueSuffix()}`;
      await fd.openSubTab('Menu');
      await fd.startAddCategory(name);
      await fd.categoryAddButton.click();
      await expect(fd.categoryNameInput).toBeHidden({ timeout: 15_000 });
      await expect(fd.main.getByText(name, { exact: true }).first()).toBeVisible({ timeout: 15_000 });
    });
  });

  test.describe('Staff kitchen board (/staff/<token>)', () => {
    let fd;
    test.beforeEach(async ({ page }) => {
      fd = new FoodDrinksPage(page);
      await fd.gotoStaffBoard(token);
    });

    test('should render the live order columns and filters @smoke', async () => {
      await expect(fd.byStatusButton).toBeVisible();
      await expect(fd.byTableButton).toBeVisible();
      await expect(fd.allergyOnlyButton).toBeVisible();
      await expect(fd.boardSearch).toBeVisible();
      for (const label of ['Pending', 'Preparing', 'Ready', 'Served']) {
        await expect(fd.main.getByText(label, { exact: true }).first()).toBeVisible();
      }
    });

    test('should switch between By Status and By Table views', async () => {
      await fd.byTableButton.click();
      await expect(fd.byTableButton).toBeVisible();
      await fd.byStatusButton.click();
      await expect(fd.byStatusButton).toBeVisible();
    });
  });
});
