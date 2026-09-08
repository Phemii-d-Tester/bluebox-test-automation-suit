# Event Creation & Events list — element reference (bluebox-test)

## Events list — `/events`
| Element | Locator |
|---|---|
| Heading | `getByRole('heading', { level: 1, name: 'Events' })` |
| Create Event | `getByRole('link', { name: 'Create Event' })` → `/events/new` |
| Stat — Total Events | `main.getByRole('article').filter({ hasText: 'Total Events' })` |
| Stat — Live Now / Upcoming / Past | filter by `'Live Now'` / `'Upcoming'` / `'Past'` |
| Tabs | `getByRole('button', { name: /^All/ })`, `/^Live/`, `/^Upcoming/`, `/^Past/`, `/^Draft/` (labels carry counts, e.g. `Draft(6)`) |
| Search | `getByPlaceholder('Search events...')` |
| Sort | `main.getByRole('combobox')` (default `Newest first`) |
| Event card | `getByRole('link', { name: /^Open / })` → `/events/<id>`; contains h3 name, `DD/MM/YYYY · HH:mm – HH:mm TZ`, venue, `N guests` |

## Create Event — `/events/new`  (single-page form, no wizard)
| Element | Locator |
|---|---|
| Heading | `getByRole('heading', { level: 1, name: 'Create Event' })` |
| Template (optional) | `getByRole('button', { name })` — Conferences, Galas & Dinners, Workshops, Weddings, Parties, Others |
| Event Name | `getByRole('textbox', { name: 'Event Name' })` |
| Start date / time | `getByRole('textbox', { name: 'Start date' })`, `{ name: 'Start time' }` |
| End date / time | `getByRole('textbox', { name: 'End date' })`, `{ name: 'End time' }` |
| Timezone | `getByRole('combobox', { name: 'Timezone' })` (default Africa/Lagos) |
| Description | `getByRole('textbox', { name: 'Add Description...' })` |
| Venue name | `getByRole('textbox', { name: 'Enter venue name' })` |
| Address (Google) | `getByRole('combobox', { name: /Search for a venue or enter address/ })` (0/300 counter) |
| Guest capacity | `main.getByRole('spinbutton')` (default 100) |
| Private event | `getByRole('switch', { name: 'Private event' })` (checked) — "guests receive a unique code to check in" |
| Cover Image | `getByRole('button', { name: /Cover Image Click or drag to upload/ })` (5 MB) + `Shuffle`, `Pick` |
| Submit | `getByRole('button', { name: 'Create Event' })` |
| Preview panel | heading `Event name goes here` |

> No 3-step wizard anymore — everything is on one page and submitted with **Create Event**.
