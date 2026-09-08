# Archived tests (Phase 2)

These specs and page objects cover BlueBox flows that are **out of scope for Phase 1**
of the `-test` re-automation. They were written against the previous `-dev` build and
are kept here for reference / reuse when Phase 2 begins. They are **not** run by the
suite (they live outside `testDir: ./tests`).

## Phase 1 (kept, rewritten for `-test`)
Authentication (Sign in, Sign up, Forgot password) · Dashboard stats · Event creation
(add/import guest, floor plan & seat setup, activate/deactivate) · Guest experience (RSVP).

## Phase 2 (archived here)
Event dashboard list, single-event view, edit event, track/host-view guest, guest groups,
unassigned-guest filter, edit guest dietary, granular seating specs (open-floor, create-zone,
add-table, floor-plan, view-seating, drag-guest, edit/delete table), menu & food (menu-builder,
add-menu, display-menu, food-summary), copy completed event, guest select-meal / find-seat,
guest-invite landing, old guest-respond, old activation-gates.

**Kiosk / guest check-in** (`/kiosk/<token>`) is also Phase 2.

To restore any of these, move the file back under `tests/` (specs) or `pages/` (POMs)
and update its locators to the current `-test` DOM.
