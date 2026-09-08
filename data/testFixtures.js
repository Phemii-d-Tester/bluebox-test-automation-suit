// Known fixtures on the -test environment (planner test account). Update the ids if
// these disposable events are removed. Read-only specs use these to avoid creating
// a fresh event on every run.
const FIXTURES = {
  // An active event with guests + an invite token (from the API test suite).
  activeEvent: {
    id: '61b5b8e5-ce95-4cb1-9f8f-f574fe10bcc5',
    name: 'API Test Event 202608041458 (disposable)',
    token: 'c44a38875a', // /invite/<token>, /join/<token>, /kiosk/<token>
  },
};

module.exports = { FIXTURES };
