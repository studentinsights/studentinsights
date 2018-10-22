import _ from 'lodash';
import {SOMERVILLE, NEW_BEDFORD, BEDFORD, DEMO} from '../helpers/PerDistrict';
import {ALL} from '../components/SimpleFilterSelect';

export const PRETTY_ENGLISH_LEARNER = 'English Learner';
export const FORMER_ENGLISH_LEARNER_KEY = 'Former English Learner';
export const PRETTY_FLUENT_ENGLISH = 'Fluent English';


// These describe all values, mapping them into discrete buckets that Insights uses in the UI.
const SOMERVILLE_MAP = {
  'Limited': STATUS.ENGLISH_LEARNER,
  'Fluent': STATUS.FLUENT_ENGLISH,
  'FLEP': STATUS.FORMER_ENGLISH_LEARNER
};

const NEW_BEDFORD_MAP = {
  'Limited English': STATUS.ENGLISH_LEARNER,
  'Non-English': STATUS.ENGLISH_LEARNER,
  'Redesignated': STATUS.FORMER_ENGLISH_LEARNER,
  'Fluent': STATUS.FLUENT_ENGLISH,
  'Native': STATUS.FLUENT_ENGLISH
};

const BEDFORD_MAP = {
  'Capable': STATUS.FLUENT_ENGLISH,
  'Limited English': STATUS.ENGLISH_LEARNER,
  'Not Capable': STATUS.ENGLISH_LEARNER
};


// These are the categories Insights uses in the UI, with functions to figure this out below.
const STATUS = {
  ENGLISH_LEARNER: 'ENGLISH_LEARNER',
  FORMER_ENGLISH_LEARNER: 'FORMER_ENGLISH_LEARNER',
  FLUENT_ENGLISH: 'FLUENT_ENGLISH',
  UNKNOWN: 'UNKNOWN'
};
const PRETTY_STATUS_TEXT = {
  [STATUS.ENGLISH_LEARNER]: 'English Learner',
  [STATUS.FORMER_ENGLISH_LEARNER]: 'Former English Learner',
  [STATUS.FLUENT_ENGLISH]: 'Fluent English',
  [STATUS.UNKNOWN]: 'No English Learner status'
};


// Bedford doesn't appear to track this the same way
export function isFormerlyEnglishLearner(districtKey, limitedEnglishProficiencyValue) {
  return languageStatus(districtKey, limitedEnglishProficiencyValue) === STATUS.FORMER_ENGLISH_LEARNER;
}

export function isFluentEnglish(districtKey, limitedEnglishProficiencyValue) {
  return languageStatus(districtKey, limitedEnglishProficiencyValue) === STATUS.FLUENT_ENGLISH;
}

export function isEnglishLearner(districtKey, limitedEnglishProficiencyValue) {
  return languageStatus(districtKey, limitedEnglishProficiencyValue) === STATUS.ENGLISH_LEARNER;
}

function languageStatus(districtKey, limitedEnglishProficiencyValue) {
  if (districtKey === SOMERVILLE) return SOMERVILLE_MAP[limitedEnglishProficiencyValue];
  if (districtKey === NEW_BEDFORD) return NEW_BEDFORD_MAP[limitedEnglishProficiencyValue];
  if (districtKey === BEDFORD) return BEDFORD_MAP[limitedEnglishProficiencyValue];
  if (districtKey === DEMO) return SOMERVILLE_MAP[limitedEnglishProficiencyValue];
  throw new Error(`unsupported districtKey: ${districtKey}`);
}

// Show the designation, and then additional information about level or FLEP date if possible
export function prettyEnglishProficiencyText(districtKey, limitedEnglishProficiencyValue, options = {}) {
  // Determine text for status overall
  const status = languageStatus(districtKey, limitedEnglishProficiencyValue);
  const statusText = PRETTY_STATUS_TEXT[status] || PRETTY_STATUS_TEXT[STATUS.UNKNOWN];

  // if fluent, just text
  if (status === STATUS.FLUENT_ENGLISH) return statusText;

  // If ELL now, show level if we can find it from a recent assessment
  if (status === STATUS.ENGLISH_LEARNER) {
    const compositeAccess = (options.access && hasAnyAccessData(options.access) && options.access.composite)
      ? options.composite
      : null;
    const levelText = (compositeAccess) ? proficiencyTextForScore(compositeAccess) : null;
    return (levelText) ? `${statusText}, ${levelText}` : statusText;
  }

  // If FLEP, add designation date also (TODO)
  if (status === STATUS.FORMER_ENGLISH_LEARNER) {
    return statusText;
  }
  
  // Unknown
  return PRETTY_STATUS_TEXT[STATUS.UNKNOWN];
}

// For use in Select dropdowns
export function englishProficiencyOptions(districtKey) {
  if (districtKey === SOMERVILLE) {
    return [
      { value: ALL, label: 'All' },
      { value: 'Fluent', label: PRETTY_FLUENT_ENGLISH },
      { value: 'Limited', label: PRETTY_ENGLISH_LEARNER },
      { value: 'FLEP', label: 'FLEP' }
    ];
  }

  throw new Error(`unsupported districtKey: ${districtKey}`);
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