import _ from 'lodash';
import chroma from 'chroma-js';
import {
  isLimitedOrFlep,
  isIepOr504,
  isLowIncome,
  isHighDiscipline,
  starBucketThresholds,
  HighlightKeys,
  starBucket
} from './studentFilters';
import {
  high,
  medium,
  low,
  genderColor,
  steelBlue
} from '../helpers/colors';



// For highlighting students based on their attributes.
export function highlightStyleForKey(student, highlightKey) {
  const highlightFn = highlightFns[highlightKey];
  return highlightFn ? highlightFn(student) : null;
}

export function userFacingValueForKey(student, highlightKey) {
  const valueFn = valueFns[highlightKey];
  return valueFn ? valueFn(student) : null;
}

const highlightFns = {
  [HighlightKeys.IEP_OR_504]: student => highlightStylesIf(isIepOr504(student)),
  [HighlightKeys.LIMITED_OR_FLEP]: student => highlightStylesIf(isLimitedOrFlep(student)),
  [HighlightKeys.LOW_INCOME]: student => highlightStylesIf(isLowIncome(student)),
  [HighlightKeys.HIGH_DISCIPLINE]: student => highlightStylesIf(isHighDiscipline(student)),
  [HighlightKeys.STAR_MATH]: student => starStyles(student.most_recent_star_math_percentile),
  [HighlightKeys.STAR_READING]: student => starStyles(student.most_recent_star_reading_percentile),
  [HighlightKeys.DIBELS]: student => dibelsStyles(student.latest_dibels),
  [HighlightKeys.GENDER]: student => {
    const backgroundColor = genderColor(student.gender);
    return {backgroundColor};
  }
};

const valueFns = {
  [HighlightKeys.IEP_OR_504]: student => isIepOr504(student) ? 'yes' : null,
  [HighlightKeys.LIMITED_OR_FLEP]: student => isLimitedOrFlep(student) ? 'yes' : null,
  [HighlightKeys.LOW_INCOME]: student => isLowIncome(student) ? 'yes' : null,
  [HighlightKeys.HIGH_DISCIPLINE]: student => isHighDiscipline(student) ? 'yes' : null,
  [HighlightKeys.STAR_MATH]: student => starBucket(student.most_recent_star_math_percentile),
  [HighlightKeys.STAR_READING]: student => starBucket(student.most_recent_star_reading_percentile),
  [HighlightKeys.DIBELS]: student => student.latest_dibels ? student.latest_dibels.benchmark : 'none',
  [HighlightKeys.GENDER]: student => student.gender,
};

// Perform color operation for STAR percentile scores, calling out high and low only
// Missing scores aren't called out.
function starStyles(maybePercentile) {
  const starScale = chroma.scale([low, medium, high]).classes(starBucketThresholds);
  const hasScore = _.isNumber(maybePercentile);
  if (!hasScore) return styles.none;
  const fraction = maybePercentile / 100;
  const backgroundColor = chroma(starScale(fraction)).alpha(0.5).css();
  return {backgroundColor};
}

function dibelsStyles(maybeLatestDibels) {
  if (!maybeLatestDibels) return styles.none;
  const benchmark = maybeLatestDibels.benchmark;
  const colorMap = {
    CORE: high,
    STRATEGIC: medium,
    INTENSIVE: low
  };
  const backgroundColor = colorMap[benchmark];
  return {backgroundColor};
}

function highlightStylesIf(isTrue) {
  return isTrue ? styles.highlight : styles.none;
}

const styles = {
  highlight: {
    backgroundColor: chroma(steelBlue).alpha(0.4).css()
  },
  none: {
    backgroundColor: 'white'
  }
};
