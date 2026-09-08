// Page Object for the Menu Builder (user-app: /food-drinks/:id).
// Locators + actions only. Verified against the live DOM.

class MenuBuilderPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');

    this.heading = page.getByRole('heading', { level: 1, name: 'Food & Drinks' });

    // --- Tabs ---
    this.tabMenuBuilder = this.main.getByRole('button', { name: 'Menu Builder' });
    this.tabOrders = this.main.getByRole('button', { name: 'Orders' });
    this.tabRequests = this.main.getByRole('button', { name: 'Requests' });
    this.tabDietaryReport = this.main.getByRole('button', { name: 'Dietary Report' });

    // --- Menu header (open/close window) ---
    this.menuToggle = this.main.getByRole('switch').first();
    this.opensLabel = this.main.getByText('Opens:');
    this.closesLabel = this.main.getByText('Closes:');
    this.samplesButton = this.main.getByRole('button', { name: 'Samples' });

    // --- Courses ---
    this.addItemButtons = this.main.getByRole('button', { name: 'Add Item' });
    this.renameCourseButtons = this.main.getByRole('button', { name: 'Rename course' });
    this.deleteCourseButtons = this.main.getByRole('button', { name: 'Delete course' });
    this.newCourseName = this.main.getByRole('textbox', { name: /New course name/ });
    this.addCourseButton = this.main.getByRole('button', { name: 'Add Course' });

    // --- Items ---
    this.removeItemButtons = this.main.getByRole('button', { name: 'Remove item' });

    // --- Preview ---
    this.menuPreview = this.main.getByText('Menu Preview');
  }

  courseSection(name) {
    return this.main.getByRole('button', { name: new RegExp(`^${name}`) });
  }

  // A menu item is a button whose accessible name starts with the item's name.
  menuItem(name) {
    return this.main.getByRole('button', { name: new RegExp(`^${name}`) });
  }

  async goto(eventId) {
    await this.page.goto(`/food-drinks/${eventId}`, { waitUntil: 'load' });
    await this.heading.waitFor({ timeout: 30_000 });
    await this.tabMenuBuilder.waitFor({ timeout: 15_000 });
  }
}

module.exports = { MenuBuilderPage };
