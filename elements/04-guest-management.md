# Guest Management — element reference (event detail → Guests tab)

## Event detail — `/events/<id>`
| Element | Locator |
|---|---|
| Event name | `getByRole('heading', { level: 1 })` |
| Edit | `getByRole('link', { name: 'Edit' })` → `/events/<id>/edit` |
| **Activate/Deactivate toggle** | `getByRole('button', { name: 'Deactivate' })` when active (`[pressed]`) / `{ name: 'Activate' }` when inactive |
| Tabs | `getByRole('button', { name })` — Overview, Guests, Seating, Food & Drinks*(disabled)*, Analytics*(disabled)*, Team*(disabled)* |
| Set up seating | `getByRole('link', { name: 'Set up seating' })` → `/seat-setup/<id>` |
| Event (invite) link | text `https://…/invite/<token>` + `getByRole('button', { name: 'Copy event link' })` |
| QR codes | `getByRole('button', { name: 'Guest' })` → /invite, `{ name: 'Check-In' }` → **/kiosk/<token>** *(Phase 2)*, `{ name: 'Staff' }` → /staff/<token> |

## Guests tab (event detail → "Guests")
| Element | Locator |
|---|---|
| Stat cards | `article` filter `On the list` / `Invited` / `Confirmed` / `Declined` |
| RSVP link | text `https://…/join/<token>` + `getByRole('button', { name: 'Copy RSVP link' })` |
| Add Guests | `getByRole('button', { name: 'Add Guests' })` |
| Import Guests | `getByRole('button', { name: 'Import Guests' })` |
| Create Groups | `getByRole('button', { name: 'Create Groups' })` |
| Search | `main.getByRole('textbox', { name: 'Search' })` |
| Group filter | combobox `All groups` ; RSVP filter combobox `All guests` |
| Table columns | Select all, Guest, RSVP, Group, Table / Seat, Dietary |
| Send Invites | `getByRole('button', { name: 'Send Invites' })` ; pagination `Previous`/`Next` |

## Add guest dialog ("Add Guests")
| Element | Locator |
|---|---|
| Dialog | `getByRole('dialog', { name: 'Add guest' })` |
| First name * | `dialog.getByRole('textbox', { name: 'First name' })` |
| Last name | `{ name: 'Last name' }` |
| Email * | `dialog.getByRole('textbox', { name: 'email@example.com' })` |
| Phone | `{ name: '+234 800 000 0000' }` |
| RSVP status | `dialog.getByRole('combobox')` (default `On the list`) |
| Group | `+ New group` button + combobox `No group` |
| Dietary tags | `getByRole('button', { name: /Dietary tags/ })` |
| Notes | `getByRole('textbox', { name: 'Custom notes...' })` |
| Send invite email | `getByRole('checkbox', { name: 'Send invite email' })` (checked) |
| Submit / Cancel | `getByRole('button', { name: 'Save & send invite' })` (disabled until required), `Cancel`, `Close` |

## Import guests dialog ("Import Guests")
| Element | Locator |
|---|---|
| Dialog | `getByRole('dialog', { name: 'Import guests' })` |
| Upload CSV | `getByRole('button', { name: /Upload CSV/ })` — backed by a hidden `input[type=file]` (use `setInputFiles`) |
| Send invitations after import | `getByRole('checkbox', { name: 'Send invitations after import' })` |
| Download template | `getByRole('button', { name: 'Download CSV template' })` |
| Import | `getByRole('button', { name: /Import \d+ guests/ })` (disabled until a CSV is parsed; count updates) |

> Test CSV: `bluebox incomplete import.csv` (7 rows, some missing email/last-name — exercises partial/validation handling).
