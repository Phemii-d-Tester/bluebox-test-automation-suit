# Dashboard — element reference (bluebox-test, `/home`)

Authenticated planner view. Account under test: the planner test account (Free Plan).

## Sidebar (complementary)
| Element | Locator |
|---|---|
| Bluebox home | `getByRole('link', { name: 'Bluebox home' })` → `/home` |
| Dashboard | `getByRole('link', { name: 'Dashboard' })` → `/home` |
| Events | `getByRole('link', { name: 'Events' })` → `/events` |
| Seat Setup | `getByRole('link', { name: 'Seat Setup' })` → `/seat-setup` |
| Food & Drinks | `getByRole('link', { name: /Food & Drinks/ })` → `/food-drinks` (shows a "Locked" badge on the Free plan; the module itself is reachable per-event) |
| Analytics | `getByRole('link', { name: 'Analytics' })` → `/analytics` |
| Settings | `getByRole('link', { name: 'Settings' })` → `/settings` |
| Log out | `banner` → `getByRole('button', { name: 'Log out' })` |
| Notifications | `getByRole('button', { name: 'Notifications' })` (badge count) |

> The sidebar now lists **Food & Drinks** and **Analytics**. The Food & Drinks nav
> entry carries a "Locked" badge on the Free plan, but the module is reachable per
> event (see `07-food-drinks.md`).

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
