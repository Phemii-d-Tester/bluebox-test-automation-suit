// Page Object for the Guests tab (event detail → Guests) + Add/Import dialogs.
// Verified against the live -test DOM.

class GuestsPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.guestsTab = this.main.getByRole('button', { name: 'Guests', exact: true });

    // Toolbar
    this.addGuestsButton = this.main.getByRole('button', { name: 'Add Guests' });
    this.importGuestsButton = this.main.getByRole('button', { name: 'Import Guests' });
    this.createGroupsButton = this.main.getByRole('button', { name: 'Create Groups' });
    this.sendInvitesButton = this.main.getByRole('button', { name: 'Send Invites' });
    this.searchInput = this.main.getByRole('textbox', { name: 'Search' });

    // Stat chips
    this.onTheListStat = this.main.getByRole('article').filter({ hasText: 'On the list' });
    this.confirmedStat = this.main.getByRole('article').filter({ hasText: 'Confirmed' });

    // Table
    this.table = this.main.getByRole('table');
    this.columnHeaders = this.table.getByRole('columnheader');
    this.dataRows = this.table.getByRole('row').filter({ has: page.getByRole('checkbox', { name: 'Select row' }) });

    // --- Add guest dialog ---
    this.addDialog = page.getByRole('dialog', { name: 'Add guest' });
    this.firstName = this.addDialog.getByRole('textbox', { name: 'First name' });
    this.lastName = this.addDialog.getByRole('textbox', { name: 'Last name' });
    this.email = this.addDialog.getByRole('textbox', { name: 'email@example.com' });
    this.phone = this.addDialog.getByRole('textbox', { name: '+234 800 000 0000' });
    this.rsvpStatus = this.addDialog.getByRole('combobox').first();
    this.dietaryTagsButton = this.addDialog.getByRole('button', { name: /Dietary tags/ });
    this.notes = this.addDialog.getByRole('textbox', { name: 'Custom notes...' });
    this.sendInviteEmail = this.addDialog.getByRole('checkbox', { name: 'Send invite email' });
    // Primary action: "Save & send invite" when send-invite is checked, "Add guest" when not.
    this.saveGuestButton = this.addDialog.getByRole('button', { name: /Save & send invite|Add guest/ });
    this.cancelAddButton = this.addDialog.getByRole('button', { name: 'Cancel' });

    // --- Import dialog ---
    this.importDialog = page.getByRole('dialog', { name: 'Import guests' });
    this.uploadCsvButton = this.importDialog.getByRole('button', { name: /Upload CSV/ });
    this.fileInput = this.importDialog.locator('input[type="file"]');
    this.sendInvitesAfterImport = this.importDialog.getByRole('checkbox', { name: 'Send invitations after import' });
    this.downloadTemplateButton = this.importDialog.getByRole('button', { name: 'Download CSV template' });
    this.importButton = this.importDialog.getByRole('button', { name: /Import \d+ guests?/ });
    this.cancelImportButton = this.importDialog.getByRole('button', { name: 'Cancel' });
  }

  async goto(eventId) {
    await this.page.goto(`/events/${eventId}`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await this.page.getByRole('heading', { level: 1 }).waitFor({ timeout: 30_000 });
    await this.guestsTab.click();
    await this.addGuestsButton.waitFor({ timeout: 15_000 });
  }

  guestRowByText(text) {
    return this.dataRows.filter({ hasText: text });
  }

  async openAddGuest() {
    await this.addGuestsButton.click();
    await this.addDialog.waitFor();
  }

  async fillGuest({ firstName, lastName, email, phone, notes } = {}) {
    if (firstName !== undefined) await this.firstName.fill(firstName);
    if (lastName !== undefined) await this.lastName.fill(lastName);
    if (email !== undefined) await this.email.fill(email);
    if (phone !== undefined) await this.phone.fill(phone);
    if (notes !== undefined) await this.notes.fill(notes);
  }

  async openImport() {
    await this.importGuestsButton.click();
    await this.importDialog.waitFor();
  }
}

module.exports = { GuestsPage };
