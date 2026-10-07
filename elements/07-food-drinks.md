# Food & Drink / Kitchen — element reference (bluebox-test)

The Food & Drink module lets a host build a menu, take guest meal orders, manage
dietary/allergy requests, and run a live kitchen board. It is activated **per event**
(the sidebar "Food & Drinks" entry shows a "Locked" badge on the Free plan, but the
feature is reached through an event that has it enabled).

Four surfaces, all modelled by `pages/user-app/food-drinks.page.js`:

## 1. Global dashboard — `/food-drinks`
Roll-up across every event with food & drinks active.
| Element | Locator |
|---|---|
| Heading | `getByRole('heading', { level: 1, name: 'Food & Drinks' })` |
| Stat — Menu items | `main.getByText('Menu items', { exact: true })` |
| Stat — Active orders | `main.getByText('Active orders', { exact: true })` |
| Stat — Pending requests | `main.getByText('Pending requests', { exact: true })` |
| Stat — Allergy alerts | `main.getByText('Allergy alerts', { exact: true })` |
| Empty state | `getByRole('heading', { name: /No Active Food & Drinks/i })` |
| Go to Events | `main.getByRole('link', { name: 'Go to Events' })` → `/events` |

## 2. Kitchen picker — `/kitchen`
| Element | Locator |
|---|---|
| Heading | `getByRole('heading', { level: 1, name: 'Kitchen' })` |
| Event card | `main.getByRole('button', { name: /<event name>/ })` → opens `/staff/<token>` |

## 3. Event Food & Drinks tab — `/events/<id>` → "Food & Drinks" tab
| Element | Locator |
|---|---|
| Tab | `main.getByRole('button', { name: 'Food & Drinks', exact: true })` |
| Open-menu switch | `getByRole('switch', { name: 'Open menu' })` |
| Kitchen View link | `getByRole('link', { name: 'Kitchen View' })` → `/staff/<token>` |
| Sub-tab Menu | `main.getByRole('button', { name: /^Menu ·/ })` (count suffix) |
| Sub-tab Orders | `main.getByRole('button', { name: /^Orders ·/ })` |
| Sub-tab Requests | `main.getByRole('button', { name: /^Requests ·/ })` |
| Sub-tab Dietary | `main.getByRole('button', { name: 'Dietary', exact: true })` |
| Add Category | `main.getByRole('button', { name: 'Add Category' })` (reveals inline editor) |
| Category name input | `main.getByRole('textbox', { name: /Category name/ })` |
| Category Add / Cancel | `main.getByRole('button', { name: 'Add'/'Cancel', exact: true })` |
| Add from samples | `main.getByRole('button', { name: 'Add from samples' })` |

**Orders sub-tab**: Pending / Preparing / Ready / Served counts, `Export CSV` (disabled
when empty), `Search orders...`, "All statuses" / "All tables" comboboxes, Previous/Next.
**Requests sub-tab**: live "raise hand" toggle `getByRole('switch', { name: 'Toggle raise hand' })`,
Pending / Acknowledged / Resolved today / Avg response counts, `Search requests...`.

## 4. Staff kitchen board — `/staff/<token>`
Live kitchen display (KDS). Also opened via "Kitchen View" / the kitchen picker.
| Element | Locator |
|---|---|
| Columns | `Pending` / `Preparing` / `Ready` / `Served` (count tiles) |
| Allergy filter | `main.getByRole('button', { name: 'Allergy Only' })` |
| View toggle | `main.getByRole('button', { name: 'By Status' / 'By Table' })` |
| Search | `main.getByRole('searchbox', { name: 'Search...' })` |
| Table filter | `main.getByRole('combobox')` ("All Tables") |

> **Fixtures.** `FIXTURES.foodDrinksEvent` (Summer Rooftop Party) has the module
> activated; `FIXTURES.activeEvent` (ZAPTEST) shows it **Locked** (an upsell card with
> "Access Food & Drink"). Menu creation is `@publish` (no automated delete affordance).
