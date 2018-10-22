import _ from 'lodash';
import {toMomentFromRailsDate} from '../helpers/toMoment';
import {SOMERVILLE, NEW_BEDFORD, BEDFORD, DEMO} from '../helpers/PerDistrict';
import {ALL} from '../components/SimpleFilterSelect';


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
  [STATUS.UNKNOWN]: 'No English Learner data'
};


// These describe all values, mapping them into discrete buckets that Insights uses in the UI.
const SOMERVILLE_MAP = {
  'Limited': STATUS.ENGLISH_LEARNER,
  'FLEP': STATUS.FORMER_ENGLISH_LEARNER,
  'Fluent': STATUS.FLUENT_ENGLISH
};

const NEW_BEDFORD_MAP = {
  'Limited English': STATUS.ENGLISH_LEARNER,
  'Non-English': STATUS.ENGLISH_LEARNER,
  'Redesignated': STATUS.FORMER_ENGLISH_LEARNER,
  'Fluent': STATUS.FLUENT_ENGLISH,
  'Native': STATUS.FLUENT_ENGLISH
};

const BEDFORD_MAP = { // Bedford doesn't appear to track FLEP the same way
  'Limited English': STATUS.ENGLISH_LEARNER,
  'Not Capable': STATUS.ENGLISH_LEARNER,
  'Capable': STATUS.FLUENT_ENGLISH
};

const LANGUAGE_MAPS_BY_DISTRICT_KEY = {
  [SOMERVILLE]: SOMERVILLE_MAP,
  [BEDFORD]: BEDFORD_MAP,
  [NEW_BEDFORD]: NEW_BEDFORD_MAP
};

// Exported only for testing
export function allCombinationsForTest() {
  return _.flatMap([SOMERVILLE, NEW_BEDFORD, BEDFORD], districtKey => {
    const mapForDistrict = LANGUAGE_MAPS_BY_DISTRICT_KEY[districtKey];
    return Object.keys(mapForDistrict).concat([null]).map(limitedEnglishProficiency => {
      return {districtKey, limitedEnglishProficiency};
    });
  });
}


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
    const levelNumber = accessLevelNumber(options.access);
    return (levelNumber === null) ? statusText : `${statusText}, level ${levelNumber}`;
  }

  // If FLEP, add transition date if we can
  if (status === STATUS.FORMER_ENGLISH_LEARNER) {
    const transitionDateText = (options.ellTransitionDate)
      ? toMomentFromRailsDate(options.ellTransitionDate).format('M/YYYY')
      : null;
    return (transitionDateText === null) ? statusText: `${statusText}, since ${transitionDateText}`;
  }
  
  // Unknown
  return PRETTY_STATUS_TEXT[STATUS.UNKNOWN];
}

// For use in Select dropdowns
export function englishProficiencyOptions(districtKey) {
  if (districtKey !== SOMERVILLE) throw new Error(`unsupported districtKey: ${districtKey}`);
  
  const districtMap = LANGUAGE_MAPS_BY_DISTRICT_KEY[districtKey];
  return [{ value: ALL, label: 'All' }].concat(Object.keys(districtMap).map(value => {
    const status = districtMap[value];
    const label = PRETTY_STATUS_TEXT[status];
    return {value, label};
  }));
}


export function hasAnyAccessData(access) {
  if (access === undefined || access === null) return false;
  return _.some(Object.keys(access), key => access[key] !== null && access[key] !== undefined);
}


// This includes rounding
export function accessLevelNumber(access, options = {}) {
  if (!hasAnyAccessData(access)) return null;
  const compositeDataPoint = access.composite;
  if (!compositeDataPoint || !compositeDataPoint.performance_level) return null;
  return roundedWidaLevel(compositeDataPoint.performance_level, options);
}

// See WIDA interpretive guide for info about rounding
// https://wida.wisc.edu/sites/default/files/resource/WIDA-Screener-Interpretive-Guide.pdf
export function roundedWidaLevel(performanceLevel, options = {}) {
  const performanceLevelFloat = parseFloat(performanceLevel);

  return (options.shouldRenderFractions)
    ? Math.floor(performanceLevelFloat*2)/2
    : Math.floor(performanceLevelFloat);
}
