const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../../pages/user-app/dashboard.page');

/** Navigate to /home and capture the authoritative dashboard API payload. */
async function gotoWithData(page, dash) {
  const [resp] = await Promise.all([
    page.waitForResponse((r) => /\/api\/v1\/dashboard/.test(r.url()) && r.ok()),
    dash.goto(),
  ]);
  return (await resp.json()).data;
}

test.describe('Dashboard @dashboard @regression', () => {
  let dash;

  test.beforeEach(async ({ page }) => {
    dash = new DashboardPage(page);
    await dash.goto();
  });

  test('should greet the planner and show the sidebar @smoke', async () => {
    await expect(dash.welcomeHeading).toBeVisible();
    await expect(dash.navDashboard).toBeVisible();
    await expect(dash.navEvents).toBeVisible();
    await expect(dash.navSeatSetup).toBeVisible();
  });

  test('should show the four dashboard stats @smoke', async () => {
    await expect(dash.totalEventsStat).toBeVisible();
    await expect(dash.totalGuestsStat).toBeVisible();
    await expect(dash.avgAttendanceStat).toBeVisible();
    await expect(dash.upcomingStat).toBeVisible();
    // Each stat shows a numeric value.
    await expect(dash.statValue('Total Events')).toHaveText(/^\d+$/);
  });

  test('should show the Your Events section with a View All link', async () => {
    await expect(dash.yourEventsHeading).toBeVisible();
    await expect(dash.viewAll).toHaveAttribute('href', '/events');
  });

  test('should render event cards linking to their event pages', async () => {
    await expect(dash.eventCards.first()).toBeVisible();
    await expect(dash.eventCards.first()).toHaveAttribute('href', /\/events\/[0-9a-f-]+/);
    // Card content: name (h3), date, venue, guest count.
    const card = dash.eventCards.first();
    await expect(card.getByRole('heading', { level: 3 })).toBeVisible();
    await expect(card).toContainText(/\d+ guests?/);
  });
});

// Data-accuracy suite — validates the cards against the authoritative dashboard API.
test.describe('Dashboard accuracy @dashboard @regression', () => {
  test('should display the 4 stat cards exactly matching the backend @smoke', async ({ page }) => {
    const dash = new DashboardPage(page);
    const data = await gotoWithData(page, dash);
    const s = data.stats;
    await expect(dash.statValue('Total Events')).toHaveText(String(s.totalEvents));
    await expect(dash.statValue('Total Guests')).toHaveText(String(s.totalGuests));
    await expect(dash.statValue('Avg. Attendance')).toHaveText(String(s.avgAttendance));
    await expect(dash.statValue('Upcoming')).toHaveText(String(s.upcoming));
  });

  test('should compute Total Events and Avg. Attendance correctly', async ({ page }) => {
    const dash = new DashboardPage(page);
    const data = await gotoWithData(page, dash);
    const s = data.stats;
    // Total Events equals the real number of events (eventsMeta.total is the count).
    expect(s.totalEvents).toBe(data.eventsMeta.total);
    // Avg. Attendance = average guests per event (integer floor).
    if (s.totalEvents > 0) {
      expect(s.avgAttendance).toBe(Math.floor(s.totalGuests / s.totalEvents));
    }
    // Upcoming cannot exceed the total number of events.
    expect(s.upcoming).toBeLessThanOrEqual(s.totalEvents);
  });

  test('should limit Your Events to 3 and View All opens the full list @smoke', async ({ page }) => {
    const dash = new DashboardPage(page);
    const data = await gotoWithData(page, dash);
    const shown = await dash.eventCards.count();
    expect(shown).toBeLessThanOrEqual(3);
    expect(shown).toBe(Math.min(3, data.eventsMeta.total));

    await dash.viewAll.click();
    await expect(page).toHaveURL(/\/events\b/);
    // The full list shows more than the dashboard's 3 (given >3 events exist).
    if (data.eventsMeta.total > 3) {
      await expect
        .poll(async () => page.getByRole('main').getByRole('link', { name: /^Open / }).count(), { timeout: 15_000 })
        .toBeGreaterThan(3);
    }
  });

  test('should show a Recent Activity feed reflecting the activity log', async ({ page }) => {
    const dash = new DashboardPage(page);
    const data = await gotoWithData(page, dash);
    test.skip((data.recentActivity || []).length === 0, 'No recent activity to verify.');
    await expect(dash.recentActivityHeading).toBeVisible();
    await expect(dash.recentActivityList.getByRole('listitem').first()).toBeVisible();
    // The feed renders (up to) as many entries as the API returned.
    const shown = await dash.recentActivityList.getByRole('listitem').count();
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThanOrEqual(data.recentActivity.length);
  });
});
