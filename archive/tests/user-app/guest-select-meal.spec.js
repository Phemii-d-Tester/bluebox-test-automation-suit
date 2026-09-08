const { test, expect } = require('@playwright/test');
const { GuestInvitePage } = require('../../pages/user-app/guest-invite.page');
const { invites } = require('../../data/invites');

const TOKEN = invites.valid.token;
const GUEST = 'Femo Tester';

// Read-only: never clicks Select (that records a choice and triggers a guest email).
test.describe('Guest Selects Meal @guest @guest-meal @regression', () => {
  let invite;

  test.beforeEach(async ({ page }) => {
    test.skip(!TOKEN, 'Set GUEST_INVITE_TOKEN in .env to run guest specs.');
    invite = new GuestInvitePage(page);
    await invite.viewAs(TOKEN, GUEST);
    await invite.openMenu();
  });

  test('should show "Select Your Meals" organised by course @smoke', async () => {
    await expect(invite.selectMealsHeading).toBeVisible();
    await expect(invite.mealCourse('Starters')).toBeVisible();
    await expect(invite.mealCourse('Main Course')).toBeVisible();
    await expect(invite.mealCourse('Desserts')).toBeVisible();
  });

  test('should show the change-before-cutoff instruction', async () => {
    await expect(invite.cutoffInstruction).toBeVisible();
  });

  test('should show selectable items with name, description and allergen chips', async () => {
    const item = invite.mealItem('Asun');
    await expect(item).toBeVisible();
    await expect(item).toContainText('Select'); // selectable affordance
    await expect(item).toContainText('A well spiced goat meat');
    await expect(item).toContainText('Mustard'); // allergen chip
  });
});
