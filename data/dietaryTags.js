// The 13 guest dietary tags, labelled EXACTLY as the Add/Edit Guest form renders
// them (verified against the live DOM — note "Gluten Free", "Shellfish Allergy",
// "Dairy Free" etc., which differ from the abbreviations in the AC text).
const DIETARY_TAGS = [
  'Vegetarian',
  'Vegan',
  'Gluten Free',
  'Halal',
  'Kosher',
  'Nut Allergy',
  'Shellfish Allergy',
  'Dairy Free',
  'Egg Free',
  'Soy Free',
  'Pescatarian',
  'Low Sodium',
  'Diabetic Friendly',
];

module.exports = { DIETARY_TAGS };
