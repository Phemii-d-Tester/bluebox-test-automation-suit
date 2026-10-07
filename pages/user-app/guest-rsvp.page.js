// Page Object for the public guest invite / RSVP entry (user-app).
//   /invite/<token> — guest invite landing ("We'd love to see you at …"),
//                     gated by a name field before the invitation opens.
//   /join/<token>   — RSVP entry; shows "Event not open yet" until the host
//                     opens the event (goes public).
// Verified against the live -test DOM. The RSVP CTAs stay disabled until the host
// opens the event, so full RSVP submission requires a public event (see the spec).

class GuestRsvpPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');

    // --- /invite/<token> landing ---
    this.invitedHeading = page.getByRole('heading', { level: 1, name: /We'd love to see you at/ });
    // Event name is a level-1 heading nested inside the invite card (article).
    this.eventName = page.getByRole('article').getByRole('heading', { level: 1 });
    this.nameInput = page.getByRole('textbox', { name: 'Enter your name' });
    this.viewInvitationButton = page.getByRole('button', { name: 'View My Invitation' });
    this.rsvpCta = page.getByRole('button', { name: 'RSVP', exact: true });
    this.findSeatButton = page.getByRole('button', { name: 'Find Seat' });
    this.selectMealsButton = page.getByRole('button', { name: 'Select Meals' });
    this.poweredBy = page.getByText('Powered by BlueBox');
    this.hostPreviewBanner = page.getByText(/Host preview/);

    // --- /join/<token> gate (event not yet open) ---
    this.notOpenHeading = page.getByRole('heading', { name: 'Event not open yet' });
  }

  async gotoInvite(token) {
    await this.page.goto(`/invite/${token}`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await this.invitedHeading.waitFor({ timeout: 30_000 });
  }

  async gotoJoin(token) {
    await this.page.goto(`/join/${token}`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await this.poweredBy.waitFor({ timeout: 30_000 }).catch(() => {});
  }
}

module.exports = { GuestRsvpPage };
