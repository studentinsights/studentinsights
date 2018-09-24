const LIMITED_ENGLISH = 'Limited English';
const FLUENT_ENGLISH = 'Fluent English';

const somervilleMap = {
  'Limited': LIMITED_ENGLISH,
  'Fluent': FLUENT_ENGLISH,
  'FLEP': 'FLEP'
};

const newBedfordMap = {
  'Limited English': LIMITED_ENGLISH,
  'Fluent': FLUENT_ENGLISH,
  'Non-English': 'Non-English',
  'Redesignated': 'Redesignated FLEP',
  'Native': 'Native English'
};

const bedfordMap = {
  'Capable': FLUENT_ENGLISH,
  'Limited English': LIMITED_ENGLISH,
  'Not Capable': LIMITED_ENGLISH
};

// This varies by district, but this implementation works across all districts for now.
export function prettyEnglishProficiencyText(limitedEnglishProficiencyValue) {
  const prettyTextMap = {
    ...somervilleMap,
    ...newBedfordMap,
    ...bedfordMap
  };
  return prettyTextMap[limitedEnglishProficiencyValue] || 'No LEP data';
}

export function isFluentEnglish(limitedEnglishProficiencyValue) {
  return (prettyEnglishProficiencyText(limitedEnglishProficiencyValue) === FLUENT_ENGLISH);
}
