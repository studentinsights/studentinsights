import React from 'react';
import _ from 'lodash';
import chroma from 'chroma-js';
import {starBucketThresholds, starBucket} from '../helpers/star';
import {
  isLimitedOrFlep,
  isIepOr504,
  isLowIncome,
  isHighDiscipline,
  HighlightKeys,
} from './studentFilters';
import {
  DIVERSITY_GROUPS,
  diversityGroupKey,
  diversityColor
} from './diversityGroups';
import {
  high,
  medium,
  low,
  genderColor,
  steelBlue
} from '../helpers/colors';
import {
  interpretFAndPEnglish,
  classifyFAndPEnglish
} from '../reading/fAndPInterpreter';


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
  [HighlightKeys.DIVERSITY_GROUP]: student => diversityGroupStyles(student),
  [HighlightKeys.F_AND_P_WINTER]: student => fAndPEnglishStyles(student),
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
  [HighlightKeys.DIVERSITY_GROUP]: student => renderDiversityGroupName(student),
  [HighlightKeys.F_AND_P_WINTER]: student => renderFAndPLevel(student),
  [HighlightKeys.GENDER]: student => student.gender
};

function renderDiversityGroupName(student) {
  const key = diversityGroupKey(student);
  const group = _.find(DIVERSITY_GROUPS, {key});
  return (
    <div title={group.description}>
      <div>{group.text}</div>
      <div>{student.race} and {student.hispanic_latino ? 'Hispanic' : 'not Hispanic'}</div>
    </div>
  );
}

function diversityGroupStyles(student) {
  const backgroundColor = diversityColor(diversityGroupKey(student));
  return {backgroundColor};
}

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

function fAndPEnglishStyles(student) {
  const {grade} = student;
  if (!grade) return styles.none;
  const maybeFAndPValue = student.winter_reading_doc ? student.winter_reading_doc.f_and_p_english : null;
  if (!maybeFAndPValue) return styles.none;
  const level = interpretFAndPEnglish(maybeFAndPValue);
  if (!level) return null;
  const category = classifyFAndPEnglish(level, grade, 'winter');
  if (!category) return null;
  const backgroundColor = {
    high,
    medium,
    low
  }[category];

  return {backgroundColor};
}

function renderFAndPLevel(student) {
  if (!student.winter_reading_doc) return null;
  if (!student.winter_reading_doc.f_and_p_english) return null;
  return student.winter_reading_doc.f_and_p_english;
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
