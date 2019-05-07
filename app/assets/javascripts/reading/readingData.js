import _ from 'lodash';
import {
  high,
  medium,
  low
} from '../helpers/colors';

export const DIBELS_DORF_WPM = 'dibels_dorf_wpm';
export const DIBELS_DORF_ACC = 'dibels_dorf_acc';
export const F_AND_P_ENGLISH = 'f_and_p_english';
export const INSTRUCTIONAL_NEEDS = 'instructional_needs';

const ORDERED_F_AND_P_ENGLISH_LEVELS = {
  'NR': 50,
  'AA': 100,
  'A': 120,
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

// all thresholds are "greater than or equal to" / "less than or equal to"
const somervilleThresholds = {
  [F_AND_P_ENGLISH]: { // based on colors from mega sheet
    'KF:winter': {
      benchmark: 'C',
      risk: 'A'
    },
    '1:winter': {
      benchmark: 'G',
      risk: 'D'
    },
  },
  [DIBELS_DORF_WPM]: {
    '3:fall': {
      benchmark: 93,
      risk: 72
    },
    '3:winter': {
      benchmark: 108,
      risk: 88
    },
    '3:spring': {
      benchmark: 123,
      risk: 100
    }
  },
  [DIBELS_DORF_ACC]: {
    '3:fall': {
      benchmark: 96,
      risk: 91
    },
    '3:winter': {
      benchmark: 97,
      risk: 93
    },
    '3:spring': {
      benchmark: 98,
      risk: 95
    }
  }
};


export function somervilleReadingThresholdsFor(benchmarkAssessmentKey, grade, benchmarkPeriodKey) {
  const thresholds = somervilleThresholds[benchmarkAssessmentKey];
  if (!thresholds) return null;
  const periodKey = [grade, benchmarkPeriodKey].join(':');
  return thresholds[periodKey] || null;
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
  if (ORDERED_F_AND_P_ENGLISH_LEVELS[level] <= thresholds.risk) return 'low';
  return 'medium';
}

// For interpreting user input like A/C or A+ or H(indep) or B-C
// for each, round down (latest independent 'mastery' level)
// if not found in list of levels and can't understand, return null
export function interpretFAndPEnglish(text) {
  if (text.indexOf('/') !== -1) return text.split('/')[0];
  if ((text.indexOf('-') !== -1)) return text.split('-')[0];
  if ((text.indexOf('+') !== -1) && (text !== 'Z+')) return text.replace('+', '');
  if ((text.indexOf('(') !== -1)) return text.replace(/\(.+\)/,'').trim();
  if (_.has(ORDERED_F_AND_P_ENGLISH_LEVELS, text)) return text;

  return null;
}
