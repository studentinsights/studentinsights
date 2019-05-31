import _ from 'lodash';
import moment from 'moment';
import {
  high,
  medium,
  low,
  missing
} from '../helpers/colors';
import {
  toSchoolYear,
  firstDayOfSchool,
  lastDayOfSchool
} from '../helpers/schoolYear';
import {
  F_AND_P_ENGLISH,
  DIBELS_DORF_WPM,
  DIBELS_DORF_ACC,
  DIBELS_FSF,
  DIBELS_LNF,
  DIBELS_PSF,
  DIBELS_NWF_CLS,
  somervilleReadingThresholdsFor
} from './thresholds';


const ORDERED_F_AND_P_ENGLISH_LEVELS = {
  'NR': 50,
  'AA': 80,
  'A': 110,
  'B': 120,
  'C': 130,
  'D': 150,
  'E': 160,
  'F': 170,
  'G': 180,
  'H': 190,
  'I': 200,
  'J': 210,
  'K': 220,
  'L': 230,
  'M': 240,
  'N': 250,
  'O': 260,
  'P': 270,
  'Q': 280,
  'R': 290,
  'S': 300,
  'T': 310,
  'U': 320,
  'V': 330,
  'W': 340,
  'X': 350,
  'Y': 360,
  'Z': 370,
  'Z+': 380
};

// benchmark_assessment_key values:
export function readDoc(doc, studentId, benchmarkAssessmentKey) {
  return (doc[studentId] || {})[benchmarkAssessmentKey] || '';
}

export function prettyDibelsText(benchmarkAssessmentKey) {
  return {
    [DIBELS_FSF]: 'First Sound Fluency',
    [DIBELS_LNF]: 'Letter Naming Fluency',
    [DIBELS_PSF]: 'Phonemic Segmentation Fluency',
    [DIBELS_NWF_CLS]: 'Nonsense Word Fluency',
    [DIBELS_DORF_WPM]: 'Oral Reading Fluency',
    [DIBELS_DORF_ACC]: 'Oral Reading Accuracy'
  }[benchmarkAssessmentKey];
}


/*
classifications - these use the language of "composite" but are
not the same, which is a bit misleading.  also, beware that...

"Because the scores used to calculate the DIBELS Composite Score vary
by grade and time of year, it is important to note that the composite
score generally cannot be used to directly measure growth over time
or to compare results across grades or times of year. However,
because the logic and procedures used to establish benchmark goals
are consistent across grades and times of year, the percent of
students at or above benchmark can be compared, even though the
mean scores are not comparable."
*/
export const DIBELS_CORE = 'DIBELS_CORE';
export const DIBELS_STRATEGIC = 'DIBELS_STRATEGIC';
export const DIBELS_INTENSIVE = 'DIBELS_INTENSIVE';
export const DIBELS_UNKNOWN = 'DIBELS_UNKNOWN';
export function classifyDibels(text, benchmarkAssessmentKey, grade, benchmarkPeriodKey) {
  // interpret
  if (!text) return DIBELS_UNKNOWN;
  const value = interpretDibels(text);
  if (!value) return DIBELS_UNKNOWN;

  // classify
  const thresholds = somervilleReadingThresholdsFor(benchmarkAssessmentKey, grade, benchmarkPeriodKey);
  if (!thresholds) return DIBELS_UNKNOWN;
  if (value >= thresholds.benchmark) return DIBELS_CORE;
  if (value <= thresholds.risk) return DIBELS_INTENSIVE;
  return DIBELS_STRATEGIC;
}

export function interpretDibels(text) {
  return parseInt(text.replace(/%/g, '').toUpperCase().trim(), 10);
}

export function colorForDibelsCategory(category) {
  return {
    [DIBELS_CORE]: high,
    [DIBELS_STRATEGIC]: medium,
    [DIBELS_INTENSIVE]: low,
    [DIBELS_UNKNOWN]: missing
  }[category] || missing;
}

export function dibelsColor(value, thresholds) {
  if (value >= thresholds.benchmark) return high;
  if (value <= thresholds.risk) return low;
  return medium;
}

export function classifyFAndPEnglish(level, grade, benchmarkPeriodKey) {
  if (!ORDERED_F_AND_P_ENGLISH_LEVELS[level]) return null;
  const thresholds = somervilleReadingThresholdsFor(F_AND_P_ENGLISH, grade, benchmarkPeriodKey);
  if (!thresholds) return null;

  if (ORDERED_F_AND_P_ENGLISH_LEVELS[level] >= ORDERED_F_AND_P_ENGLISH_LEVELS[thresholds.benchmark]) return 'high';

  // might not be a "risk"
  if (thresholds.risk && ORDERED_F_AND_P_ENGLISH_LEVELS[level] <= ORDERED_F_AND_P_ENGLISH_LEVELS[thresholds.risk]) return 'low';
  return 'medium';
}

// For interpreting user input like A/C or A+ or H(indep) or B-C
// for each, round down (latest independent 'mastery' level)
// if not found in list of levels and can't understand, return null
export function interpretFAndPEnglish(text) {
  if (text.indexOf('/') !== -1) return text.split('/')[0].toUpperCase();
  if ((text.indexOf('-') !== -1)) return text.split('-')[0].toUpperCase();
  if ((text.indexOf('+') !== -1) && (text !== 'Z+')) return text.replace('+', '').toUpperCase();
  if ((text.indexOf('(') !== -1)) return text.replace(/\(.+\)/,'').trim().toUpperCase();
  if (_.has(ORDERED_F_AND_P_ENGLISH_LEVELS, text.toUpperCase())) return text.toUpperCase();

  return null;
}

export function orderedFAndPLevels() {
  return _.sortBy(Object.keys(ORDERED_F_AND_P_ENGLISH_LEVELS), level => ORDERED_F_AND_P_ENGLISH_LEVELS[level]);
}

// see ReadingBenchmarkDataPoint#benchmark_period_key_at
export function benchmarkPeriodKeyFor(timeMoment) {
  const year = toSchoolYear(timeMoment);
  const fallStart = firstDayOfSchool(year);
  const winterStart = toMoment([year+1, 1, 1]);
  const springStart = toMoment([year+1, 5, 1]);
  const summerStart = lastDayOfSchool(year);

  if (timeMoment.isBetween(fallStart, winterStart)) return 'fall';
  if (timeMoment.isBetween(winterStart, springStart)) return 'winter';
  if (timeMoment.isBetween(springStart, summerStart)) return 'spring';
  return 'summer';
}

function toMoment(triple) {
  return moment.utc([triple[0], triple[1], triple[2]].join('-'), 'YYYY-M-D');
}
