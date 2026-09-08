const { test, expect } = require('@playwright/test');
const { ViewSeatingPage } = require('../../pages/user-app/view-seating.page');
const { SEEDED_EVENTS } = require('../../data/seededEvents');

const EVENT = SEEDED_EVENTS.birthdayParty;

test.describe('View Seating @view-seating @regression', () => {
  let seating;

  test.beforeEach(async ({ page }) => {
    seating = new ViewSeatingPage(page);
    await seating.goto();
  });

  test('should show the heading and summary stats @smoke', async () => {
    await expect(seating.heading).toBeVisible();
    await expect(seating.eventsWithSeatingStat).toBeVisible();
    await expect(seating.seatsMappedStat).toBeVisible();
    await expect(seating.sectionsDefinedStat).toBeVisible();
  });

  test('should show the four tabs (All, Live, Upcoming, Draft)', async () => {
    await expect(seating.tabAll).toBeVisible();
    await expect(seating.tabLive).toBeVisible();
    await expect(seating.tabUpcoming).toBeVisible();
    await expect(seating.tabDraft).toBeVisible();
  });

  test('should show a search control', async () => {
    await expect(seating.searchInput).toBeVisible();
  });

  test('should render an event row with sections, mapped count and progress @smoke', async () => {
    const card = seating.eventCardByName(EVENT.name);
    await expect(card).toBeVisible();
    // Wait for the card's seating data to finish loading (it briefly renders an
    // empty "Set up seats" state before the mapped counts arrive).
    await expect(card.getByRole('link', { name: 'Open editor' })).toBeVisible();
    await expect(card).toContainText('SECTIONS');
    await expect(card).toContainText(/MAPPED\s*\d+\s*\/\s*\d+/);
    await expect(card).toContainText(/Assignment progress/);
    await expect(card).toContainText(/\d+%/);
  });

  test('should link a set-up event to its seating editor', async () => {
    const card = seating.eventCardByName(EVENT.name);
    await expect(card.getByRole('link', { name: 'Open editor' })).toHaveAttribute(
      'href',
      `/seat-setup/${EVENT.id}`
    );
  });

  test('should filter the events by search term', async () => {
    await seating.search(EVENT.name);
    await expect(seating.eventCardByName(EVENT.name)).toBeVisible();
    await expect(seating.eventCardByName('Cleanup Probe')).toHaveCount(0);
  });
});
