const { test, expect } = require('@playwright/test');
const { GuestsPage } = require('../../pages/user-app/guests.page');
const { SEEDED_EVENTS } = require('../../data/seededEvents');

const EVENT = SEEDED_EVENTS.birthdayParty;

test.describe('Track Guest @track-guest @regression', () => {
  let guests;

  test.beforeEach(async ({ page }) => {
    guests = new GuestsPage(page);
    await guests.goto(EVENT.id);
  });

  test('should show the guest table with the expected columns @smoke', async () => {
    for (const col of ['Guest', 'Email', 'RSVP', 'Group', 'Table / Seat', 'Dietary']) {
      await expect(guests.columnHeaders.filter({ hasText: col }).first()).toBeVisible();
    }
  });

  test('should show Add and Import CSV buttons', async () => {
    await expect(guests.addButton).toBeVisible();
    await expect(guests.importCsvButton).toBeVisible();
  });

  test('should show a Send All Pending button with an unsent count', async () => {
    await expect(guests.sendAllPendingButton).toBeVisible();
    await expect(guests.sendAllPendingButton).toContainText(/Send All Pending \(\d+\)/);
  });

  test('should show search and group-filter controls', async () => {
    await expect(guests.searchInput).toBeVisible();
    await expect(guests.groupFilter).toBeVisible();
  });

  test('should show pagination info (X–Y of total)', async () => {
    await expect(guests.paginationInfo).toBeVisible();
    await expect(guests.paginationInfo).toHaveText(/Showing \d+.\d+ of \d+ guests/);
  });

  test('should list the seeded guests with RSVP, group and dietary data', async () => {
    expect(await guests.dataRows.count()).toBeGreaterThan(0);
    const row = guests.guestRowByName('Femo Tester');
    await expect(row).toBeVisible();
    await expect(row).toContainText('femolala@yopmail.com');
    await expect(row).toContainText('Confirmed');
  });

  test('should filter the table by a search term', async () => {
    await guests.search('Femo');
    await expect(guests.guestRowByName('Femo Tester')).toBeVisible();
    await expect(guests.guestRowByName('Benjamin Tester')).toHaveCount(0);
  });
});
