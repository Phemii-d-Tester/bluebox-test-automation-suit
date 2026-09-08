# Dashboard — element reference (bluebox-test, `/home`)

Authenticated planner view. Account under test: the planner test account (Free Plan).

## Sidebar (complementary)
| Element | Locator |
|---|---|
| Bluebox home | `getByRole('link', { name: 'Bluebox home' })` → `/home` |
| Dashboard | `getByRole('link', { name: 'Dashboard' })` → `/home` |
| Events | `getByRole('link', { name: 'Events' })` → `/events` |
| Seat Setup | `getByRole('link', { name: 'Seat Setup' })` → `/seat-setup` |
| Analytics | text `Analytics` (nav item) |
| Settings | text `Settings` |
| Log out | `banner` → `getByRole('button', { name: 'Log out' })` |
| Notifications | `getByRole('button', { name: 'Notifications' })` (badge count) |

> Nav no longer lists "Food & Drinks" (Phase 2). 

## Dashboard stats (main)
| Element | Locator |
|---|---|
| Welcome heading | `getByRole('heading', { level: 1, name: /^Welcome,/ })` |
| Stat — Total Events | `main.getByText('Total Events')` (value in sibling paragraph) |
| Stat — Total Guests | `main.getByText('Total Guests')` |
| Stat — Avg. Attendance | `main.getByText('Avg. Attendance')` |
| Stat — Upcoming | `main.getByText('Upcoming')` |
| Your Events heading | `getByRole('heading', { level: 2, name: 'Your Events' })` |
| View All | `getByRole('link', { name: 'View All' })` → `/events` |

## Event cards (Your Events)
Each card is a link `Open <event name>` → `/events/<id>` containing:
- `getByRole('heading', { level: 3 })` — event name
- date text e.g. `15/09/2026 · 19:00 GMT+1`  (format DD/MM/YYYY · HH:mm TZ)
- venue text e.g. `API Test Hall`
- guest count text e.g. `6 guests`  (no more `X / Y guests`; module badges removed)
- optional status text `Upcoming`

Sample current stats: Total Events **8**, Total Guests **25**, Avg. Attendance **2**, Upcoming **8**.
