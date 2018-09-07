// This varies by district, but this implementation works across
// Somerville and New Bedford.
const notFluentValues = [
  // Somerville
  'Limited',
  'FLEP',

  // New Bedford
  'Non-English',
  'Limited English',
  'Redesignated'
];
export function isLimitedOrFlep(student) {
  return notFluentValues.indexOf(student.limited_english_proficiency) !== -1;
}


const prettyTextMap = {
  // Somerville
  'Limited': 'Limited English',
  'FLEP': 'FLEP',

  // New Bedford
  'Non-English': 'Non-English',
  'Limited English': 'Limited English',
  'Redesignated': 'Redesignated FLEP',
  'Native': 'Native English',

  // Somerville + New Bedford
  'Fluent': 'Fluent English'
};
export function prettyEnglishProficiencyText(limitedEnglishProficiencyValue) {
  return prettyTextMap[limitedEnglishProficiencyValue] || 'No LEP data';
}
