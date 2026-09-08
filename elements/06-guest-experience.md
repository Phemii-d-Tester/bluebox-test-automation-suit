# Guest Experience — element reference (public)

## RSVP landing — `/join/<token>`
| Element | Locator |
|---|---|
| Heading | `getByRole('heading', { level: 1, name: "You're invited to" })` |
| Event name | `getByRole('heading', { level: 2 })` + date/time/venue |
| RSVP CTA | `getByRole('button', { name: 'RSVP for This Event' })` |
| Find Seat | `getByRole('link', { name: 'Find Seat' })` → `/invite/<token>?tab=seat` |
| Select Meals | `getByRole('link', { name: 'Select Meals' })` → `/invite/<token>?tab=menu` |
| Footer | `getByText('Powered by BlueBox')` |

### RSVP form (after "RSVP for This Event")
| Element | Locator |
|---|---|
| Heading | `getByRole('heading', { name: 'Awaiting your response' })` |
| First name * | `getByRole('textbox', { name: 'First name *' })` |
| Last name | `getByRole('textbox', { name: 'Last name' })` |
| Email * | `getByRole('textbox', { name: 'Email *' })` |
| Phone | `getByRole('textbox', { name: 'Phone' })` |
| Dietary tags | `getByRole('button', { name: /Dietary tags/ })` |
| Notes to host | `getByRole('textbox', { name: 'Notes to host' })` |
| Submit / Cancel | `getByRole('button', { name: 'RSVP' })`, `{ name: 'Cancel' }` |

## Personalized invite — `/invite/<token>`
| Element | Locator |
|---|---|
| Name gate | `getByRole('textbox', { name: 'Enter your name' })` + `getByRole('button', { name: 'View My Invitation' })` (disabled until name) |
| After name → "Event Activities" | Quick Actions: `getByRole('button', { name: 'Raise Hand' })`, `{ name: 'Find Seat' }`, `{ name: 'Order Meal' }` |
| Recent activities | includes check-in status e.g. `Checked in … Successful` |
| Bottom nav | Event, Menu*(disabled)*, My Seat, Feedback |

> **Check-in / Kiosk** (`/kiosk/<token>`, staff-authenticated) is **Phase 2** — not covered now.
> Phase-1 guest experience = **RSVP** (`/join/<token>`).
