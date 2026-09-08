const { test, expect } = require('@playwright/test');
const { MenuBuilderPage } = require('../../pages/user-app/menu-builder.page');
const { AddMenuItemDialog } = require('../../pages/user-app/add-menu-item.dialog');
const { SEEDED_EVENTS } = require('../../data/seededEvents');
const { ALLERGENS, MENU_DIETARY_TAGS } = require('../../data/allergens');
const { uniqueSuffix } = require('../../utils/generators');

const EVENT = SEEDED_EVENTS.birthdayParty;

test.describe('Add Menu @add-menu @regression', () => {
  // Modal-only checks — never submit, so the seeded menu is untouched.
  test.describe('Add Menu Item form (no save)', () => {
    let menu;
    let dialog;

    test.beforeEach(async ({ page }) => {
      menu = new MenuBuilderPage(page);
      dialog = new AddMenuItemDialog(page);
      await menu.goto(EVENT.id);
      await menu.addItemButtons.first().click();
      await expect(dialog.heading).toBeVisible();
    });

    test('should open with image upload, name, description, course, available and Add CTA @smoke', async () => {
      await expect(dialog.uploadHint).toBeVisible();
      await expect(dialog.itemName).toBeVisible();
      await expect(dialog.description).toBeVisible();
      await expect(dialog.course).toBeVisible();
      await expect(dialog.available).toBeVisible();
      await expect(dialog.addButton).toBeVisible();
    });

    test('should require an item name before Add is enabled', async () => {
      await expect(dialog.addButton).toBeDisabled();
      await dialog.fill({ name: `QA Item ${uniqueSuffix()}` });
      await expect(dialog.addButton).toBeEnabled();
    });

    test('should cap the item name at 50 characters', async () => {
      // KNOWN BUG: the AC says Item Name max 50, but this field accepts more (no
      // maxlength, unlike the event-name field). test.fail documents it and keeps
      // the suite green; it flips to a hard failure once the cap is enforced.
      test.fail(true, 'Item Name is not capped at 50 characters.');
      await dialog.itemName.fill('X'.repeat(60));
      await expect(dialog.itemName).toHaveValue('X'.repeat(50));
    });

    test('should show all 14 allergens', async () => {
      for (const a of ALLERGENS) {
        await expect(dialog.allergen(a)).toBeVisible();
      }
    });

    test('should show the named dietary-tag options', async () => {
      for (const tag of MENU_DIETARY_TAGS) {
        await expect(dialog.dietaryTag(tag)).toBeVisible();
      }
    });

    test('should default Available to on', async () => {
      await expect(dialog.available).toBeChecked();
    });

    test('should dismiss on Close', async () => {
      await dialog.closeButton.click();
      await expect(dialog.dialog).toBeHidden();
    });
  });

  // @publish: persists a menu item on the seeded event's menu (items ARE removable
  // in the UI, but this leaves it in place; on demand only).
  test.describe('Persisting a menu item', () => {
    test('should add an item that appears in the menu @publish', async ({ page }) => {
      const menu = new MenuBuilderPage(page);
      const dialog = new AddMenuItemDialog(page);
      await menu.goto(EVENT.id);

      const name = `QA Item ${uniqueSuffix()}`;
      await menu.addItemButtons.first().click();
      await expect(dialog.heading).toBeVisible();
      await dialog.fill({ name, description: 'Created by automated E2E test.' });
      await dialog.addButton.click();

      await expect(dialog.dialog).toBeHidden({ timeout: 10_000 });
      await expect(menu.main.getByText(name).first()).toBeVisible({ timeout: 10_000 });
    });
  });
});
