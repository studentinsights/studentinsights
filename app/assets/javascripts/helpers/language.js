const prettyEnglishProficiencyTextMap = {
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

// This varies by district, but this implementation works across
// Somerville and New Bedford.
export function prettyEnglishProficiencyText(limitedEnglishProficiencyValue) {
  return prettyEnglishProficiencyTextMap[limitedEnglishProficiencyValue] || 'No LEP data';
}
