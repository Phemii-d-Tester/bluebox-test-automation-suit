const { test, expect } = require('@playwright/test');
const { FoodSummaryPage } = require('../../pages/user-app/food-summary.page');
const { SEEDED_EVENTS } = require('../../data/seededEvents');

const EVENT = SEEDED_EVENTS.birthdayParty;

test.describe('Food Summary @food-summary @regression', () => {
  let food;

  test.beforeEach(async ({ page }) => {
    food = new FoodSummaryPage(page);
    await food.goto(EVENT.id);
  });

  test('should show the three sub-tabs @smoke', async () => {
    await expect(food.foodMenuTab).toBeVisible();
    await expect(food.barDrinksTab).toBeVisible();
    await expect(food.serviceRequestsTab).toBeVisible();
  });

  test('should show the table columns (Item, Category, Ordered, Status)', async () => {
    for (const col of ['Item', 'Category', 'Ordered', 'Status']) {
      await expect(food.columnHeaders.filter({ hasText: col }).first()).toBeVisible();
    }
  });

  test('should list food items with category and availability status', async () => {
    const row = food.itemRow('Asun');
    await expect(row).toBeVisible();
    await expect(row).toContainText('Starters');
    await expect(row).toContainText(/available|unavailable/);
  });

  test('should show a Set up from Food and Drink link', async () => {
    await expect(food.setUpLink).toHaveAttribute('href', `/food-drinks/${EVENT.id}`);
  });

  test('should switch to the Bar & Drinks sub-tab', async ({ page }) => {
    await food.barDrinksTab.click();
    await expect(page.getByRole('heading', { level: 1, name: EVENT.name })).toBeVisible();
  });
});
