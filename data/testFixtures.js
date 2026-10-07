// Known fixtures on the -test environment (Host test account). Update the ids if
// these disposable events are removed. Read-only specs use these to avoid creating
// a fresh event on every run.
const FIXTURES = {
  // General-purpose event: has guests on the list + an invite token, used by the
  // guest, seating and activate/deactivate suites. Not yet public ("Go public").
  activeEvent: {
    id: '65a66509-7b5b-4a7a-90b9-b4a38f87b53b',
    name: 'ZAPTEST-28152099',
    token: '33f9c8ab4a', // /invite/<token>, /join/<token>, /kiosk/<token>
  },
  // Event with the Food & Drink module activated (menu editor, kitchen board).
  // Food & Drinks is plan-/activation-gated per event; this one is unlocked.
  foodDrinksEvent: {
    id: '338f2290-b4f7-4fed-ac11-72f4f5c05208',
    name: 'Summer Rooftop Party',
    token: 'f3a6f60003', // /invite/<token>, /staff/<token> (kitchen board)
  },
};

module.exports = { FIXTURES };
