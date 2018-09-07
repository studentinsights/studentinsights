// const prettyEnglishProficiencyTextMap = {
//   // Somerville
//   'Limited': 'Limited English',
//   'FLEP': 'FLEP',

//   // New Bedford
//   'Non-English': 'Non-English',
//   'Limited English': 'Limited English',
//   'Redesignated': 'Redesignated FLEP',
//   'Native': 'Native English',

//   // Somerville + New Bedford
//   'Fluent': 'Fluent English'
// };

// // This varies by district, but this implementation works across
// // Somerville and New Bedford.
// export function prettySpecialEducationT(limitedEnglishProficiencyValue) {
//   return prettyEnglishProficiencyTextMap[limitedEnglishProficiencyValue] || 'No LEP data';
// }

// export function hasAnySpecialEducationData(student, maybeIepDocument) {
//   if (maybeIepDocument !== null) return true;
//   if (['Does Not Apply', null].indexOf(student.sped_level_of_need) !== -1) return true;
//   if (['Does Not Apply', null].indexOf(student.disability) !== -1) return true;
//   if (['None', 'Not Enrolled', 'Not special ed', null].indexOf(student.sped_placement) !== -1) return true;
//   if (student.sped_liaison !== null) return true;
  
//   return false;
// }