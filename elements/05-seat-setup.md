# Seat Setup / Floor Plan — element reference

## Seat Setup entry — `/seat-setup/<id>`
| Element | Locator |
|---|---|
| Back | `getByRole('link', { name: 'Back to seat setup' })` → `/seat-setup` |
| Heading | `getByRole('heading', { level: 1, name: 'Seat Setup' })` (subtitle `<event> · Floor Plan`) |
| Preview | `getByRole('link', { name: 'Preview' })` → `/events/<id>?tab=Seating` |
| Empty state | `getByRole('heading', { level: 3, name: 'No Seat Setup Yet' })` + `getByRole('button', { name: 'Create floor plan' })` |

## Floor plan editor (after Create floor plan)
| Element | Locator |
|---|---|
| Auto-Assign | `getByRole('button', { name: 'Auto-Assign', exact: true })` |
| Add Table | `getByRole('button', { name: 'Add Table' })` |
| More table options | `getByRole('button', { name: 'More table options' })` |
| Add Zone | `getByRole('button', { name: 'Add Zone' })` |
| Stage position | `getByRole('button', { name: 'Stage position' })` (label `Add Stage`) |
| Door position | `getByRole('button', { name: 'Door position' })` (label `Door · Bottom`) |
| Restroom position | `getByRole('button', { name: 'Restroom position' })` (label `Add Restroom`) |
| Filters | `getByRole('button', { name: 'Groups' })`, `{ name: 'Dietary' }`, `{ name: 'Zone Servers' }`(disabled) |
| Zoom | `getByRole('button', { name: 'Zoom in' })` / `'Zoom out'` ; `'Enter fullscreen'` |
| Unassigned panel | `main.getByRole('complementary')` → `getByText('Unassigned Guests')` + count, `getByRole('searchbox')`, draggable guest buttons `[aria-roledescription="draggable"]` |
| Tables list | complementary `getByText('Tables')` + rows `#1 T1 6/8` |
| Assigned status | `getByText(/\d+ \/ \d+ Assigned/)` |

## Activate / Deactivate (on event detail `/events/<id>`)
- Active event shows `getByRole('button', { name: 'Deactivate' })` (aria `[pressed]`).
- Clicking toggles to **Activate**. The event card / "Event Page" shows `Activated` vs inactive status.
- Deactivating gates public invite/RSVP availability.
