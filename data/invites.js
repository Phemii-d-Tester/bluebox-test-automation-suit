// Guest invite test data.
//
// `valid` points at a seeded guest invite (configured via .env) plus the event
// details expected to render on the landing. Update `expected` if you re-point
// GUEST_INVITE_TOKEN at a different seeded event.
require('dotenv').config();

const invites = {
  valid: {
    token: process.env.GUEST_INVITE_TOKEN || '',
    guestName: process.env.GUEST_NAME || '',
    // Expected landing content for the seeded event. Used by happy-path assertions.
    expected: {
      eventName: 'Birthday Party',
      date: 'Friday, August 14, 2026',
      time: '10:00 – 14:00',
      venueName: 'Ikeja City Mall',
      address: '25, Airport drive, Ikeja.',
      status: 'Upcoming',
    },
  },
  // A deliberately malformed token for the "Invite not found" negative case.
  invalid: {
    token: 'invalidtoken999',
  },
};

module.exports = { invites };
