// Page Object for the Host View Guest profile side panel (Guests tab → click row).
// Locators + actions only. Verified against the live DOM.

class GuestProfilePanel {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {string} guestName — the panel is a dialog labelled with the guest name.
   */
  constructor(page, guestName) {
    this.page = page;
    this.dialog = page.getByRole('dialog', { name: guestName });
    this.heading = this.dialog.getByRole('heading', { name: guestName });

    this.rsvpSeatingSection = this.dialog.getByRole('button', { name: 'RSVP & Seating' });
    this.changeSeatButton = this.dialog.getByRole('button', { name: 'Change Seat' });
    this.dietaryProfileSection = this.dialog.getByRole('button', { name: 'Dietary Profile' });

    this.ordersTab = this.dialog.getByRole('button', { name: /^Orders/ });
    this.serviceRequestsTab = this.dialog.getByRole('button', { name: /^Service Requests/ });
    this.feedbackTab = this.dialog.getByRole('button', { name: 'Post-Event Feedback' });

    this.exportProfileButton = this.dialog.getByRole('button', { name: 'Export Profile' });
    this.deleteGuestButton = this.dialog.getByRole('button', { name: 'Delete Guest Data (GDPR)' });
    this.closeButton = this.dialog.getByRole('button', { name: 'Close' });
  }
}

module.exports = { GuestProfilePanel };
