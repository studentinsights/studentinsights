import _ from 'lodash';
import {SOMERVILLE} from '../helpers/PerDistrict';
import {ALL} from '../components/SimpleFilterSelect';

export const LIMITED_ENGLISH = 'Limited English';
export const FLUENT_ENGLISH = 'Fluent English';

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

export function englishProficiencyOptions(districtKey) {
  if (districtKey === SOMERVILLE) {
    return [
      { value: ALL, label: 'All' },
      { value: 'Fluent', label: FLUENT_ENGLISH },
      { value: 'Limited', label: LIMITED_ENGLISH },
      { value: 'FLEP', label: 'FLEP' }
    ];
  }

  throw new Error(`unsupported districtKey: ${districtKey}`);
}

// This varies by district, but this implementation works across all districts for now.
export function prettyEnglishProficiencyText(limitedEnglishProficiencyValue, access) {
  const prettyTextMap = {
    ...somervilleMap,
    ...newBedfordMap,
    ...bedfordMap
  };
  return (hasAnyAccessData(access) && access.composite)
    ? proficiencyTextForScore(access.composite)
    : prettyTextMap[limitedEnglishProficiencyValue] || 'No LEP status';
}

export function isFluentEnglish(limitedEnglishProficiencyValue) {
  return (prettyEnglishProficiencyText(limitedEnglishProficiencyValue) === FLUENT_ENGLISH);
}

export function hasAnyAccessData(access) {
  return _.some(Object.keys(access), key => access[key]);
}

export function proficiencyTextForScore(compositeDataPoint, options = {}) {
  if (!compositeDataPoint || !compositeDataPoint.performance_level) return 'No data';
  const englishText = options.withoutEnglishText ? '' : ' English';
  const scoreNumber = parseFloat(compositeDataPoint.performance_level);
  if (!scoreNumber) return 'No data';
  if (scoreNumber < 2) return `Entering${englishText}, level 1`;
  if (scoreNumber < 3) return `Emerging${englishText}, level 2`;
  if (scoreNumber < 4) return `Developing${englishText}, level 3`;
  if (scoreNumber < 5) return `Expanding${englishText}, level 4`;
  if (scoreNumber < 6) return `Bridging${englishText}, level 5`;
  if (scoreNumber === 6) return `Reaching${englishText}, level 6`;

  return 'Unknown';
}