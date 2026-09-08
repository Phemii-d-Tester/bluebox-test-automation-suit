const { test, expect } = require('@playwright/test');
const { MenuBuilderPage } = require('../../pages/user-app/menu-builder.page');
const { SEEDED_EVENTS } = require('../../data/seededEvents');

const EVENT = SEEDED_EVENTS.birthdayParty;

// Read-only: inspects how the seeded menu items render. Never deletes.
test.describe('Display Menu @display-menu @regression', () => {
  let menu;

  test.beforeEach(async ({ page }) => {
    menu = new MenuBuilderPage(page);
    await menu.goto(EVENT.id);
    // Menu items stream in after the shell — wait for one before reading counts.
    await expect(menu.menuItem('Asun')).toBeVisible();
  });

  test('should show items with name, description and allergen/dietary chips @smoke', async () => {
    const item = menu.menuItem('Asun');
    await expect(item).toBeVisible();
    await expect(item).toContainText('A well spiced goat meat'); // description
    await expect(item).toContainText('Mustard'); // allergen chip
    await expect(item).toContainText('Sulphites');
  });

  test('should expose a delete (Remove item) action per item', async () => {
    await expect(menu.removeItemButtons.first()).toBeVisible();
  });

  test('should show an item count in each section header', async () => {
    await expect(menu.courseSection('Starters')).toContainText(/\d/);
    await expect(menu.courseSection('Main Course')).toContainText(/\d/);
  });

  test('should reflect items in the Menu Preview panel', async () => {
    await expect(menu.menuPreview).toBeVisible();
    // The preview container (anchored by its "Ordering is open/closed" state line)
    // lists the same items as the editor.
    const previewPanel = menu.menuPreview.locator('xpath=ancestor::*[contains(., "Starters")][1]');
    await expect(previewPanel).toContainText('Asun');
  });

  test('should open a pre-filled Edit Menu Item dialog when an item is clicked', async ({ page }) => {
    await menu.menuItem('Asun').click();
    const editDialog = page.getByRole('dialog', { name: 'Edit Menu Item' });
    await expect(editDialog).toBeVisible();
    await expect(editDialog.getByRole('textbox', { name: 'Item Name *' })).toHaveValue('Asun');
    await editDialog.getByRole('button', { name: 'Close' }).click();
    await expect(editDialog).toBeHidden();
  });
});
