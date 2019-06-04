import React from 'react';
import {isEnglishLearner, roundedWidaLevel} from '../helpers/language';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import LanguageStatusLink from '../student_profile/LanguageStatusLink';
import Chip from './Chip';
import {Summary, Concern, TwoLineChip, secondLineDaysAgo} from './layout';
import Tooltip from './Tooltip';


export default function ChipForLanguage(props) {
  const {student, access, accessKey, nowMoment, districtKey} = props;
  const limitedEnglishProficiency = student.limited_english_proficiency;
  const languageStatusEl = (
    <LanguageStatusLink
      style={{fontSize: 12}}
      studentFirstName={student.first_name}
      ellTransitionDate={student.ell_transition_date}
      limitedEnglishProficiency={limitedEnglishProficiency}
      access={access} 
    />
  );

  // TODO(kr) improve to split oral / written
  const concernKey = isEnglishLearner(districtKey, limitedEnglishProficiency)
    ? 'medium'
    : 'low';

  // TODO(kr) improve
  const dataPoint = (access || {})[accessKey];
  const mostRecentMoment = languageAssessmentMoment(dataPoint);
  
  // render as score, use fractions for composites
  const score = (!dataPoint)
    ? null 
    : roundedWidaLevel(dataPoint.performance_level, {shouldRenderFractions: true});

  const daysAgo = mostRecentMoment ? nowMoment.clone().diff(mostRecentMoment, 'days') : null;
  return (
    <Concern concernKey={concernKey}>
      <Tooltip title={
        <Summary
          atMoment={mostRecentMoment}
          concernKey={concernKey}
          score={score}
          name={`ACCESS WIDA Levels: ${accessKey}`}
        />
      }>
        <TwoLineChip
          firstLine={languageStatusEl}
          secondLine={({width}) => secondLineDaysAgo(daysAgo, width)}
        />
      </Tooltip>
    </Concern>
  );
}

function languageAssessmentMoment(dataPoint) {
  if (!dataPoint) return null;
  if (!dataPoint.date_taken) return null;
  return toMomentFromTimestamp(dataPoint.date_taken);
}

