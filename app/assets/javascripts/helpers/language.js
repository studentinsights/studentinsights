import _ from 'lodash';

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
export function prettyEnglishProficiencyText(limitedEnglishProficiencyValue, access) {
  const prettyTextMap = {
    ...somervilleMap,
    ...newBedfordMap,
    ...bedfordMap
  };
  const proficiencySuffix = (hasAnyAccessData(access) && access.composite)
    ? ` (${proficiencyTextForScore(access.composite)})`
    : '';
  const designationText = prettyTextMap[limitedEnglishProficiencyValue] || 'No LEP status';
  return designationText + proficiencySuffix;
}

export function isFluentEnglish(limitedEnglishProficiencyValue) {
  return (prettyEnglishProficiencyText(limitedEnglishProficiencyValue) === FLUENT_ENGLISH);
}

export function hasAnyAccessData(access) {
  return _.some(Object.keys(access), key => access[key]);
}

export function proficiencyTextForScore(compositeDataPoint) {
  if (!compositeDataPoint || !compositeDataPoint.performance_level) return 'No data';
  
  const scoreNumber = parseFloat(compositeDataPoint.performance_level);
  if (!scoreNumber) return 'No data';
  if (scoreNumber < 2) return 'Entering (1)';
  if (scoreNumber < 3) return 'Emerging (2)';
  if (scoreNumber < 4) return 'Developing (3)';
  if (scoreNumber < 5) return 'Expanding (4)';
  if (scoreNumber < 6) return 'Bridging (5)';
  if (scoreNumber === 6) return 'Reaching (6)';

  return 'Unknown';
}