const { test, expect } = require('@playwright/test');
const { GuestsPage } = require('../../pages/user-app/guests.page');
const { SEEDED_EVENTS } = require('../../data/seededEvents');

const EVENT = SEEDED_EVENTS.birthdayParty;
const GROUP = 'Aso-ebi Geng'; // group all seeded guests belong to

test.describe('Guest Group @guest-group @regression', () => {
  let guests;

  test.beforeEach(async ({ page }) => {
    guests = new GuestsPage(page);
    await guests.goto(EVENT.id);
  });

  test('should show the All Groups dropdown in the Guests tab @smoke', async () => {
    await expect(guests.groupFilter).toBeVisible();
    await expect(guests.groupFilter).toContainText('All Groups');
  });

  test('should list the event groups as filter options', async () => {
    await guests.groupFilter.click();
    await expect(guests.page.getByRole('option', { name: GROUP })).toBeVisible();
    await guests.page.keyboard.press('Escape');
  });

  test('should filter the table by a selected group', async () => {
    await guests.filterByGroup(GROUP);
    await expect(guests.groupFilter).toContainText(GROUP);
    await expect(guests.guestRowByName('Femo Tester')).toBeVisible();
    expect(await guests.dataRows.count()).toBeGreaterThan(0);
  });

  test('should clear back to All Groups', async () => {
    await guests.filterByGroup(GROUP);
    await guests.filterByGroup('All Groups');
    await expect(guests.groupFilter).toContainText('All Groups');
    expect(await guests.dataRows.count()).toBeGreaterThan(0);
  });

  test('should work alongside the search bar', async () => {
    await guests.filterByGroup(GROUP);
    await guests.search('Femo');
    await expect(guests.guestRowByName('Femo Tester')).toBeVisible();
    await expect(guests.guestRowByName('Benjamin Tester')).toHaveCount(0);
  });
});
