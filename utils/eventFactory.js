// Test helper: create a fresh event via the real Create Event form and return its
// id (read from the resulting /events/<id> URL). Used by @publish tests that need
// their own event to mutate.
const { CreateEventPage } = require('../pages/user-app/create-event.page');
const { futureDate } = require('./dates');
const { uniqueSuffix } = require('./generators');

async function createEvent(page, { name } = {}) {
  const eventName = name || `Fixture Event ${uniqueSuffix()}`;
  const wizard = new CreateEventPage(page);
  await wizard.goto();
  await wizard.fill({
    name: eventName,
    startDate: futureDate(30),
    startTime: '09:00',
    endDate: futureDate(30),
    endTime: '17:00',
    venueName: 'QA Hall',
    location: '24 Test Avenue, Ikeja, Lagos',
    capacity: 100,
  });
  await wizard.submit();
  await page.waitForURL(/\/events\/[0-9a-f-]{6,}/, { timeout: 30_000 });
  const id = (page.url().match(/\/events\/([0-9a-f-]{6,})/) || [])[1];
  return { id, name: eventName };
}

module.exports = { createEvent };
