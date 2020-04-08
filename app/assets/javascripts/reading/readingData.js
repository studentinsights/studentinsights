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
  INSTRUCTIONAL_NEEDS,
  F_AND_P_ENGLISH,
  F_AND_P_SPANISH,
  DIBELS_DORF_WPM,
  DIBELS_DORF_ACC,
  DIBELS_DORF_ERRORS,
  DIBELS_FSF,
  DIBELS_LNF,
  DIBELS_PSF,
  DIBELS_NWF_CLS,
  DIBELS_NWF_WWR,
  somervilleReadingThresholdsFor
} from './thresholds';
import {
  interpretFAndPEnglish,
  fAndPOrdering,
  orderedFAndPLevels
} from './fAndPInterpreter';


// benchmark_assessment_key values:
export function readDoc(doc, studentId, benchmarkAssessmentKey) {
  return (doc[studentId] || {})[benchmarkAssessmentKey] || '';
}

export function prettyDibelsText(benchmarkAssessmentKey) {
  return {
    [DIBELS_FSF]: 'First Sound Fluency',
    [DIBELS_LNF]: 'Letter Naming Fluency',
    [DIBELS_PSF]: 'Phoneme Segmentation Fluency',
    [DIBELS_NWF_CLS]: 'Nonsense Word Fluency Correct Letter Sounds',
    [DIBELS_NWF_WWR]: 'Nonsense Word Fluency Whole Words Read',
    [DIBELS_DORF_WPM]: 'Oral Reading Fluency',
    [DIBELS_DORF_ACC]: 'Oral Reading Accuracy',
    [F_AND_P_ENGLISH]: 'F&P English',
    [F_AND_P_SPANISH]: 'F&P Spanish',
    [INSTRUCTIONAL_NEEDS]: 'Instructional needs'
  }[benchmarkAssessmentKey];
}
export function shortDibelsText(benchmarkAssessmentKey) {
  return {
    [DIBELS_FSF]: 'FSF',
    [DIBELS_LNF]: 'LNF',
    [DIBELS_PSF]: 'PSF',
    [DIBELS_NWF_CLS]: 'NWF cls',
    [DIBELS_NWF_WWR]: 'NWF wwr',
    [DIBELS_DORF_WPM]: 'ORF wpm',
    [DIBELS_DORF_ACC]: 'ORF acc',
    [DIBELS_DORF_ERRORS]: 'ORF errors',
    [F_AND_P_ENGLISH]: 'F&P English',
    [F_AND_P_SPANISH]: 'F&P Spanish',
    [INSTRUCTIONAL_NEEDS]: 'Instructional needs'
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

// deprecated
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

export const DIBELS_GREEN = 'dibels_green';
export const DIBELS_YELLOW = 'dibels_yellow';
export const DIBELS_RED = 'dibels_red';
export function bucketForDibels(text, benchmarkAssessmentKey, grade, benchmarkPeriodKey) {
  // interpret
  if (!text) return DIBELS_UNKNOWN;
  const value = interpretDibels(text);
  if (value === null || value === undefined) return DIBELS_UNKNOWN;

  // classify
  const thresholds = somervilleReadingThresholdsFor(benchmarkAssessmentKey, grade, benchmarkPeriodKey);
  if (!thresholds) return DIBELS_UNKNOWN;
  if (value >= thresholds.benchmark) return DIBELS_GREEN;
  if (value <= thresholds.risk) return DIBELS_RED;
  return DIBELS_YELLOW;
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

export function benchmarkPeriodToMoment(benchmarkPeriodKey, schoolYear) {
  if (benchmarkPeriodKey === 'fall') return toMoment([schoolYear, 9, 1]);
  if (benchmarkPeriodKey === 'winter') return toMoment([schoolYear+1, 1, 1]);
  if (benchmarkPeriodKey === 'spring') return toMoment([schoolYear+1, 5, 1]);
  if (benchmarkPeriodKey === 'summer') return lastDayOfSchool(schoolYear);
  return null;
}

function toMoment(triple) {
  return moment.utc([triple[0], triple[1], triple[2]].join('-'), 'YYYY-M-D');
}


// For `_.orderBy` sorting
export function rankBenchmarkDataPoint(d) {
  const benchmarkAssessmentKey = d.benchmark_assessment_key;
  const text = d.json ? d.json.value : null;
  if (benchmarkAssessmentKey === INSTRUCTIONAL_NEEDS) {
    return text || -1;
  }

  if ([F_AND_P_ENGLISH, F_AND_P_SPANISH].indexOf(benchmarkAssessmentKey) !== -1) {
    return fAndPOrdering(text) || -1;
  }

  // dibels
  const value = interpretDibels(text);
  return (value === null || value === undefined) ? -1 : value;
}

// Figure out what is between the [benchmark, risk] values
export function computeMids(thresholds, benchmarkAssessmentKey, grade, benchmarkPeriodKey) {
  if (!thresholds) return [null, null];
  if (thresholds.risk === undefined || thresholds.benchmark === undefined) return [null, null];  

  if ([F_AND_P_ENGLISH, F_AND_P_SPANISH].indexOf(benchmarkAssessmentKey) !== -1) {
    const levels = orderedFAndPLevels();
    return [
      levels[levels.indexOf(thresholds.risk) + 1],
      levels[levels.indexOf(thresholds.benchmark) - 1]
    ];
  }

  return [
    thresholds.risk + 1,
    thresholds.benchmark - 1
  ];
}


// Decide whether to highlight based on thresholds; returns true|false|null.
export function shouldHighlightBenchmarkDataPoint(dataPoint, gradeThen) {
  const thresholds = somervilleReadingThresholdsFor(...[
    dataPoint.benchmark_assessment_key,
    gradeThen,
    dataPoint.benchmark_period_key
  ]);

  // No threshold
  if (!thresholds || thresholds.benchmark === undefined) return null;

  // For Dibels, we can compare numerically, but for F&P we have to compare
  // differently.
  if ([F_AND_P_ENGLISH, F_AND_P_SPANISH].indexOf(dataPoint.benchmark_assessment_key) !== -1) {
    const allLevels = orderedFAndPLevels();
    const benchmarkIndex = allLevels.indexOf(thresholds.benchmark);
    const level = interpretFAndPEnglish(dataPoint.json.value);
    const levelIndex = allLevels.indexOf(level);
    return (levelIndex < benchmarkIndex);
  }

  return (dataPoint.json.value < thresholds.benchmark);
}


// Get most recent data point, regardless of time.
export function mostRecentDataPointFor(dataPoints, benchmarkAssessmentKey) {
  const benchmarkDataPoints = dataPoints.filter(d => d.benchmark_assessment_key === benchmarkAssessmentKey);
  return _.last(_.sortBy(benchmarkDataPoints, dataPoint => {
    return benchmarkPeriodToMoment(dataPoint.benchmark_period_key, dataPoint.benchmark_school_year).unix();
  }));
}
