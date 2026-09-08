const { test, expect } = require('@playwright/test');
const { MenuBuilderPage } = require('../../pages/user-app/menu-builder.page');
const { SEEDED_EVENTS } = require('../../data/seededEvents');

const EVENT = SEEDED_EVENTS.birthdayParty;

// Read-only: never triggers Delete course / Samples on the seeded menu.
test.describe('Menu Builder @menu-builder @regression', () => {
  let menu;

  test.beforeEach(async ({ page }) => {
    menu = new MenuBuilderPage(page);
    await menu.goto(EVENT.id);
  });

  test('should show the four tabs (Menu Builder, Orders, Requests, Dietary Report) @smoke', async () => {
    await expect(menu.tabMenuBuilder).toBeVisible();
    await expect(menu.tabOrders).toBeVisible();
    await expect(menu.tabRequests).toBeVisible();
    await expect(menu.tabDietaryReport).toBeVisible();
  });

  test('should show the open/close toggle with Opens and Closes times', async () => {
    await expect(menu.menuToggle).toBeVisible();
    await expect(menu.opensLabel).toBeVisible();
    await expect(menu.closesLabel).toBeVisible();
  });

  test('should show course sections each with an Add Item control', async () => {
    await expect(menu.courseSection('Starters')).toBeVisible();
    await expect(menu.courseSection('Main Course')).toBeVisible();
    await expect(menu.courseSection('Desserts')).toBeVisible();
    expect(await menu.addItemButtons.count()).toBeGreaterThanOrEqual(3);
  });

  test('should expose rename and delete controls per course', async () => {
    // Rename/Delete are hover-revealed icon controls in the course header.
    await menu.courseSection('Starters').hover();
    await expect(menu.renameCourseButtons.first()).toBeVisible();
    await expect(menu.deleteCourseButtons.first()).toBeVisible();
  });

  test('should require a name before a course can be added', async () => {
    await expect(menu.addCourseButton).toBeDisabled();
    await menu.newCourseName.fill('Beverages');
    await expect(menu.addCourseButton).toBeEnabled();
  });

  test('should offer Samples and a Menu Preview', async () => {
    await expect(menu.samplesButton).toBeVisible();
    await expect(menu.menuPreview).toBeVisible();
  });
});
