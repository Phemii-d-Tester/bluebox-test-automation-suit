// Page Object for the public Guest RSVP flow (user-app: /join/<token>).
// Verified against the live -test DOM.

class GuestRsvpPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    this.invitedHeading = page.getByRole('heading', { level: 1, name: "You're invited to" });
    this.eventName = page.getByRole('heading', { level: 2 });
    this.rsvpCta = page.getByRole('button', { name: 'RSVP for This Event' });
    this.findSeatLink = page.getByRole('link', { name: 'Find Seat' });
    this.selectMealsLink = page.getByRole('link', { name: 'Select Meals' });
    this.poweredBy = page.getByText('Powered by BlueBox');

    // RSVP form (after clicking the CTA)
    this.awaitingHeading = page.getByRole('heading', { name: 'Awaiting your response' });
    this.firstName = page.getByRole('textbox', { name: 'First name *' });
    this.lastName = page.getByRole('textbox', { name: 'Last name' });
    this.email = page.getByRole('textbox', { name: 'Email *' });
    this.phone = page.getByRole('textbox', { name: 'Phone' });
    this.dietaryTagsButton = page.getByRole('button', { name: /Dietary tags/ });
    this.notes = page.getByRole('textbox', { name: 'Notes to host' });
    this.rsvpSubmit = page.getByRole('button', { name: 'RSVP', exact: true });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });

    // Confirmation modal (step 2 of RSVP).
    this.confirmAcceptanceHeading = page.getByRole('heading', { name: 'Confirm Acceptance' });
    this.confirmRsvpButton = page.getByRole('button', { name: 'Confirm RSVP' });
  }

  async submitAndConfirm() {
    await this.rsvpSubmit.click();
    await this.confirmRsvpButton.waitFor({ timeout: 15_000 });
    await this.confirmRsvpButton.click();
  }

  async goto(token) {
    await this.page.goto(`/join/${token}`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await this.invitedHeading.waitFor({ timeout: 30_000 });
  }

  async openForm() {
    await this.rsvpCta.click();
    await this.awaitingHeading.waitFor({ timeout: 15_000 });
  }

  async fill({ firstName, lastName, email, phone, notes } = {}) {
    if (firstName !== undefined) await this.firstName.fill(firstName);
    if (lastName !== undefined) await this.lastName.fill(lastName);
    if (email !== undefined) await this.email.fill(email);
    if (phone !== undefined) await this.phone.fill(phone);
    if (notes !== undefined) await this.notes.fill(notes);
  }
}

module.exports = { GuestRsvpPage };
