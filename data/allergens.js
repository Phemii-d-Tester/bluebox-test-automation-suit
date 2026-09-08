// Single source of truth — the 14 menu allergens (Add Menu module).
const ALLERGENS = [
  'Celery',
  'Crustaceans',
  'Fish',
  'Lupin',
  'Milk',
  'Molluscs',
  'Mustard',
  'Nuts',
  'Peanuts',
  'Sesame',
  'Soya',
  'Sulphites',
  'Gluten',
  'Eggs',
];

// The five named dietary-tag buttons on the menu item form (more abbreviation-only
// ones exist, but these are the labelled set called out in the AC).
const MENU_DIETARY_TAGS = ['V — Vegetarian', 'VG — Vegan', 'GF — Gluten-Free', 'HA — Halal', 'KO — Kosher'];

module.exports = { ALLERGENS, MENU_DIETARY_TAGS };
