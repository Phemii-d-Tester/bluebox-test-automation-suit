// Known seeded events on the dev environment, used by read-only specs
// (single-event view, edit). Kept in one place so an id change is a one-line fix.
const SEEDED_EVENTS = {
  birthdayParty: {
    id: '5dbeff15-0c4a-45f8-b033-2b2f3b62248c',
    name: 'Birthday Party',
    venue: 'Ikeja City Mall',
    date: 'August 14, 2026',
    status: 'Upcoming',
  },
};

module.exports = { SEEDED_EVENTS };
