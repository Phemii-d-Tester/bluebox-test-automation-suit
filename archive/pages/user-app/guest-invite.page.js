// Page Object for the Guest Invite landing page (user-app: /invite/<token>).
// Locators + actions only — NO assertions (those live in the spec).
//
// Locators were verified against the live DOM via the Claude Chrome extension
// on the seeded "Birthday Party" invite. Strategy follows the kickoff priority:
// getByRole > getByPlaceholder > getByText.

class GuestInvitePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // --- Header ---
    this.brand = page.getByText('Bluebox', { exact: true });
    this.statusBadge = page.getByText('Upcoming', { exact: true });

    // --- Invitation card (the <article>) ---
    this.invitationCard = page.getByRole('article');
    this.invitedToLabel = page.getByText("You're invited to");
    this.eventNameHeading = this.invitationCard.getByRole('heading');

    // --- Name entry ---
    this.namePrompt = page.getByText('Enter your name to view your seat, meals & event details.');
    this.nameInput = page.getByPlaceholder('Your full name');
    this.clearButton = page.getByRole('button', { name: 'Clear' });
    this.viewInvitationButton = page.getByRole('button', { name: 'View My Invitation' });

    // --- Bottom tab bar ---
    this.findYourSeatTab = page.getByRole('button', { name: 'Find Your Seat' });
    this.selectMealsTab = page.getByRole('button', { name: 'Select Meals' });
    this.rsvpTab = page.getByRole('button', { name: 'RSVP' });

    // --- RSVP (shown after viewing a recognised guest's invitation) ---
    this.rsvpLabel = page.getByText('Your RSVP', { exact: true });
    this.rsvpStatus = page.getByText(/Awaiting your response|You're going!|declined/i);
    this.acceptButton = page.getByRole('button', { name: 'Accept' });
    this.declineButton = page.getByRole('button', { name: 'Decline' });

    // --- Personalised portal bottom nav (after viewing as a recognised guest) ---
    this.portalEventTab = page.getByRole('button', { name: 'Event', exact: true });
    this.portalMenuTab = page.getByRole('button', { name: 'Menu', exact: true });
    this.portalSeatTab = page.getByRole('button', { name: 'My Seat', exact: true });

    // --- Select Meals tab ---
    this.selectMealsHeading = page.getByRole('heading', { name: 'Select Your Meals' });
    this.cutoffInstruction = page.getByText(/Change anytime before the cutoff/i);
    this.orderingClosed = page.getByText(/Ordering is currently closed/i);

    // --- My Seat tab ---
    this.mySeatHeading = page.getByRole('heading', { name: 'My Seat' });
    this.seatCard = page.getByRole('main').getByRole('article');
    this.routeToggle = page.getByRole('button', { name: /Show me how to get there/i });

    // --- Footer ---
    this.poweredBy = page.getByText('Powered by');
    this.blueboxLink = page.getByRole('link', { name: 'BlueBox' });

    // --- "Invite not found" error state (invalid token) ---
    this.notFoundHeading = page.getByText('Invite not found');
    this.notFoundMessage = page.getByText(/this invite link is invalid or the event is no longer available/i);
  }

  /** Open the guest invite landing for a given token. baseURL = USER_APP_URL. */
  async goto(token) {
    await this.page.goto(`/invite/${token}`);
  }

  async enterName(name) {
    await this.nameInput.fill(name);
  }

  async clearName() {
    await this.clearButton.click();
  }

  /** Fill the name and submit the "View My Invitation" CTA. */
  async viewInvitation(name) {
    await this.nameInput.fill(name);
    await this.viewInvitationButton.click();
  }

  /** Open the invite and view it as a recognised guest (reveals their RSVP). */
  async viewAs(token, name) {
    await this.goto(token);
    await this.viewInvitation(name);
    await this.rsvpLabel.waitFor({ timeout: 15_000 });
  }

  mealCourse(name) {
    return this.page.getByRole('heading', { level: 2, name });
  }

  mealItem(name) {
    return this.page.getByRole('main').getByRole('button', { name: new RegExp(name) });
  }

  async openMenu() {
    await this.portalMenuTab.click();
    await this.selectMealsHeading.waitFor({ timeout: 15_000 });
  }

  async openMySeat() {
    await this.portalSeatTab.click();
    await this.mySeatHeading.waitFor({ timeout: 15_000 });
  }
}

module.exports = { GuestInvitePage };
