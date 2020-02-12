import _ from 'lodash';
import {
  F_AND_P_ENGLISH,
  somervilleReadingThresholdsFor
} from './thresholds';

// See also f_and_p_interpreter.rb
// For interpreting user input like A/C or A+ or H(indep) or B-C
// for each, round down (latest independent 'mastery' level)
// if not found in list of levels and can't understand, return null
export function interpretFAndPEnglish(text) {
  // always trim whitespace
  if (text.length !== text.trim().length) return interpretFAndPEnglish(text.trim());

  // F, NR, AA (exact match)
  const exactMatch = strictMatchForFAndPLevel(text);
  if (exactMatch) return exactMatch;

  // F+
  if (_.endsWith(text, '+')) {
    return strictMatchForFAndPLevel(text.slice(0, -1));
  }

  // F?
  if (_.endsWith(text, '?')) {
    return strictMatchForFAndPLevel(text.slice(0, -1));
  }

  // F-G or F/G
  if (text.indexOf('/') !== -1) return strictMatchForFAndPLevel(text.split('/')[0]);
  if ((text.indexOf('-') !== -1)) return strictMatchForFAndPLevel(text.split('-')[0]);

  // F (indep) or F (instructional)
  if ((text.indexOf('(') !== -1)) {
    return strictMatchForFAndPLevel(text.replace(/\([^)]+\)/g, ''));
  }

  return null;
}

// Returns integer for sorting or _.orderBy
// See also f_and_p_interpreter.rb
export function fAndPOrdering(text) {
  const level = interpretFAndPEnglish(text);
  return ORDERED_F_AND_P_ENGLISH_LEVELS[level] || 0;
}

// Returns all normalized levels, in order.
export function orderedFAndPLevels() {
  return _.sortBy(Object.keys(ORDERED_F_AND_P_ENGLISH_LEVELS), level => ORDERED_F_AND_P_ENGLISH_LEVELS[level]);
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


// Only letters and whitespace, no other characters
// See also f_and_p_interpreter.rb
function strictMatchForFAndPLevel(text) {
  const normalized = text.trim().toUpperCase();
  return (_.has(ORDERED_F_AND_P_ENGLISH_LEVELS, normalized))
    ? normalized
    : null;
}

// See also f_and_p_interpreter.rb, reading_benchmark_data_point.rb
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
  'Z': 370 // Z+ is also a special case per F&P docs, but ignore it for now since folks use + a lot of different places
};