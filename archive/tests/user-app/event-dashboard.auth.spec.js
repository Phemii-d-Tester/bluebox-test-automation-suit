const { test, expect } = require('@playwright/test');
const { EventDashboardPage } = require('../../pages/user-app/event-dashboard.page');

/** Parse the "(n)" count out of a filter-tab label, e.g. "Upcoming(6)" -> 6. */
async function tabCount(tab) {
  const text = (await tab.textContent()) || '';
  const m = text.match(/\((\d+)\)/);
  return m ? Number(m[1]) : null;
}

test.describe('Event Dashboard @event-dashboard @regression', () => {
  let dash;

  test.beforeEach(async ({ page }) => {
    dash = new EventDashboardPage(page);
    await dash.goto();
  });

  test.describe('UI presence', () => {
    test('should show the Events heading and a Create Event CTA @smoke', async () => {
      await expect(dash.heading).toBeVisible();
      await expect(dash.createEventLink).toBeVisible();
      await expect(dash.createEventLink).toHaveAttribute('href', '/events/new');
    });

    test('should show the four summary stats', async () => {
      await expect(dash.totalEventsStat).toBeVisible();
      await expect(dash.liveNowStat).toBeVisible();
      await expect(dash.upcomingStat).toBeVisible();
      await expect(dash.pastStat).toBeVisible();
    });

    test('should show all five filter tabs', async () => {
      await expect(dash.tabAll).toBeVisible();
      await expect(dash.tabLive).toBeVisible();
      await expect(dash.tabUpcoming).toBeVisible();
      await expect(dash.tabPast).toBeVisible();
      await expect(dash.tabDraft).toBeVisible();
    });

    test('should show search and sort controls', async () => {
      await expect(dash.searchInput).toBeVisible();
      await expect(dash.sortSelect).toBeVisible();
    });

    test('should always show a "Create New Event" card', async () => {
      await expect(dash.createNewEventCard).toBeVisible();
      await expect(dash.createNewEventCard).toHaveAttribute('href', '/events/new');
    });
  });

  test.describe('Event cards', () => {
    test('should render cards with name, date, venue, guest count and status @smoke', async () => {
      const card = dash.eventCards.first();
      await expect(card).toBeVisible();
      await expect(dash.cardTitle(card)).toBeVisible(); // name
      await expect(card).toContainText(/[A-Z][a-z]+ \d{1,2}, \d{4}/); // date
      await expect(card).toContainText(/\d+\s*\/\s*\d+\s+guests/); // guest count
      await expect(card.getByRole('link', { name: /Open|Live/ })).toBeVisible(); // status / open
    });

    test('an event card should link to its single-event view', async () => {
      const link = dash.eventCards.first().getByRole('link', { name: /Open|Live/ });
      await expect(link).toHaveAttribute('href', /\/events\/[0-9a-f-]+$/);
    });
  });

  test.describe('Filtering', () => {
    test('should filter the list to match the selected tab count', async () => {
      const upcoming = await tabCount(dash.tabUpcoming);
      test.skip(upcoming === null, 'Upcoming tab has no count label.');
      await dash.tabUpcoming.click();
      await expect(dash.eventCards).toHaveCount(upcoming);
    });

    test('should show an empty list for a tab with no events', async () => {
      const past = await tabCount(dash.tabPast);
      test.skip(past !== 0, 'Past tab is not empty in current data.');
      await dash.tabPast.click();
      await expect(dash.eventCards).toHaveCount(0);
    });

    test('should restore the full list under the All tab', async () => {
      await dash.tabPast.click();
      await dash.tabAll.click();
      expect(await dash.eventCards.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Search', () => {
    test('should filter cards by a matching search term', async () => {
      await dash.search('Birthday');
      await expect(dash.eventCardByName('Birthday Party')).toBeVisible();
      await expect(dash.eventCardByName('Sarah & James Wedding')).toHaveCount(0);
    });

    test('should show no cards for a non-matching search', async () => {
      await dash.search('zzz-no-such-event-zzz');
      await expect(dash.eventCards).toHaveCount(0);
    });
  });

  test.describe('Sort', () => {
    test('should reorder the list when the sort order is changed', async () => {
      test.skip((await dash.eventCards.count()) < 2, 'Need at least two events to compare ordering.');
      const firstNewest = await dash.cardTitle(dash.eventCards.first()).textContent();
      await dash.sortBy('Oldest first');
      await expect(dash.cardTitle(dash.eventCards.first())).not.toHaveText(firstNewest || '');
    });
  });
});
