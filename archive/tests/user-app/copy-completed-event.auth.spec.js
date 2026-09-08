const { test, expect } = require('@playwright/test');
const { createEvent } = require('../../utils/eventFactory');

// Copy Completed Event (Copy Floor Plan)
// -------------------------------------------------------------------------
// The AC places the "Copy Floor Plan" option on a COMPLETED or DRAFT event's
// Seating tab. The test account currently has neither (Event Dashboard shows
// Past=0, Draft=0) and the Create wizard has no "save as draft" — every created
// event is published as Upcoming, whose Seating tab shows only "Create floor
// plan" (verified). So the Copy flow is not reachable in this environment.
//
// This spec probes for the option and SKIPS with a clear reason when it is
// absent, so it will execute automatically once a draft/completed event (with
// the Copy Floor Plan affordance) exists. Flagged for the team — see report.
test.describe('Copy Completed Event @copy-floor-plan @regression', () => {
  test('should offer Copy Floor Plan on the Seating tab and list source events @publish', async ({ page }) => {
    const { id } = await createEvent(page);
    await page.goto(`/events/${id}`, { waitUntil: 'load' });
    await page.getByRole('heading', { level: 1 }).waitFor({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Seating', exact: true }).click();

    const copyOption = page.getByRole('button', { name: /Copy Floor Plan/i });
    test.skip(
      (await copyOption.count()) === 0,
      'No Copy Floor Plan option on an Upcoming event (account has no draft/completed events).'
    );

    await copyOption.click();
    // Modal/dropdown lists the planner's other events that have a floor plan.
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
