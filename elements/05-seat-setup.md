# Seating layout — element reference

> **Redesigned.** The old free-form Floor Plan editor (Create floor plan → Add
> Table / Add Zone dialogs, Auto-Assign, draggable guests) has been replaced by a
> **template-based Seating layout editor**. Pick a layout template, place Stage /
> Door / Restroom via position menus, assign a seating category per table, then
> Save layout.

## Seating layout entry — `/seat-setup/<id>`
| Element | Locator |
|---|---|
| Heading | `getByRole('heading', { level: 1, name: 'Seating layout' })` |
| Back to Event | `getByRole('link', { name: /Back to Event/ })` → `/events/<id>?tab=Seating` |
| Preview | `main.getByRole('button', { name: 'Preview' })` |
| Save layout | `main.getByRole('button', { name: 'Save layout' })` |

## Element placement (position menus)
Each button opens a menu of `menuitemradio` slots: `No Stage` (default, checked),
`Top Left`, `Top Center`, `Top Right`, `Right Top/Center/Bottom`, `Bottom
Right/Center/Left`, `Left Bottom/Center/Top`. A slot already taken by another
element is disabled.
| Element | Locator |
|---|---|
| Stage position | `main.getByRole('button', { name: 'Stage position' })` (label → `Stage · <slot>` once placed) |
| Door position | `main.getByRole('button', { name: 'Door position' })` (label → `Door · <slot>`) |
| Restroom position | `main.getByRole('button', { name: 'Restroom position' })` |
| Position slot | `getByRole('menuitemradio', { name: '<slot>', exact: true })` |

## Templates panel (left `complementary`)
| Element | Locator |
|---|---|
| Heading | `complementary.getByRole('heading', { name: 'Templates' })` |
| Template | `complementary.getByRole('button', { name: /Banquet · 4×4 | Banquet · 3×3 | Wedding · Reception | Conference · Classroom/ })` |

## Canvas (after a template is applied)
| Element | Locator |
|---|---|
| Per-table category | `main.getByRole('button', { name: 'Assign Category' })` (one per table) |
| Stage / Door markers | `main.getByText('Stage')` / `main.getByText('Main Door')` |
| Zoom / fit | `main.getByRole('button', { name: 'Fit to screen' })`, `−` / `+` |
| Snap to grid | `main.getByRole('switch')` (checked) |
| Undo / Redo | `main.getByRole('button', { name: 'Undo' / 'Redo' })` |
| Assigned status | `getByText(/\d+ \/ \d+ Assigned/)` |

## Activate / Deactivate (on event detail `/events/<id>`)
- Active event shows `getByRole('button', { name: 'Deactivate' })`.
- A brand-new inactive event shows **Go public**; a previously-active one shows **Re-activate**.
- Going public gates public invite/RSVP availability (`/join/<token>` shows
  "Event not open yet" until the host opens the event).
