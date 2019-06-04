import React from 'react';
import _ from 'lodash';
import {AutoSizer} from 'react-virtualized';
import {gradeText, adjustedGrade} from '../helpers/gradeText';
import {
  prettyDibelsText,
  shortDibelsText,
  benchmarkPeriodToMoment,
  bucketForDibels,
  DIBELS_GREEN,
  DIBELS_YELLOW,
  DIBELS_RED,
  DIBELS_UNKNOWN
} from '../reading/readingData';
import {somervilleReadingThresholdsFor} from '../reading/thresholds';
import {Concern, TwoLineChip} from './layout';
import HoverSummary, {thresholdsExplanation, secondLineDaysAgo} from './HoverSummary';
import Tooltip from './Tooltip';
import Freshness from './Freshness';


// TODO(kr) unroll to show historical
// TODO(kr) schoolYear/gradeThen?
export default function ChipForDibels(props) {
  const {ingredientName, student, nowMoment, benchmarkAssessmentKey, dataPointsByAssessmentKey} = props;

  // const currentSchoolYear = toSchoolYear(nowMoment.toDate());

  // pick latest
  const dataPoints = dataPointsByAssessmentKey[benchmarkAssessmentKey] || [];
  const mostRecentDataPoint = _.last(_.sortBy(dataPoints, d => {
    const assessmentMoment = dataPointMoment(d);
    return (assessmentMoment) ? assessmentMoment.unix() : Number.MIN_VALUE;
  }));
  if (!mostRecentDataPoint) return null;

  // guess as grade at time of assessment
  const gradeThen = adjustedGrade(mostRecentDataPoint.benchmark_school_year, student.grade, nowMoment);

  // determine color
  const dibelsBucket = bucketForDibels(...[
    mostRecentDataPoint.json.value,
    mostRecentDataPoint.benchmark_assessment_key,
    gradeThen,
    mostRecentDataPoint.benchmark_period_key
  ]);
  const concernKey = {
    [DIBELS_GREEN]: 'low',
    [DIBELS_YELLOW]: 'medium',
    [DIBELS_RED]: 'high',
    [DIBELS_UNKNOWN]: 'unknown'
  }[dibelsBucket];

  // also show cut points
  const thresholds = somervilleReadingThresholdsFor(...[
    mostRecentDataPoint.benchmark_assessment_key,
    gradeThen,
    mostRecentDataPoint.benchmark_period_key
  ]);

  const score = mostRecentDataPoint.json.value;
  const prettyAssessmentText = prettyDibelsText(benchmarkAssessmentKey);
  const atMoment = dataPointMoment(mostRecentDataPoint);
  const daysAgo = atMoment ? nowMoment.clone().diff(atMoment, 'days') : null
  const WIDTH_THRESHOLD_PIXELS = 80;
  return (
    <Freshness daysAgo={daysAgo}>
      <Concern concernKey={concernKey}>
        <Tooltip title={
          <HoverSummary
            name={prettyAssessmentText}
            atMoment={dataPointMoment(mostRecentDataPoint)}
            period={`${mostRecentDataPoint.benchmark_period_key} ${mostRecentDataPoint.benchmark_school_year} in ${gradeText(gradeThen)}`}
            score={score}
            thresholds={thresholdsExplanation(thresholds)}
            concernKey={concernKey}
          />
        }>
          <TwoLineChip
            firstLine={({width}) => {
              return (width > WIDTH_THRESHOLD_PIXELS)
                ? prettyAssessmentText
                : shortDibelsText(mostRecentDataPoint.benchmark_assessment_key);
            }}
            secondLine={({width}) => secondLineDaysAgo(daysAgo, width)}
          />
        </Tooltip>
      </Concern>
    </Freshness>
  );
}
        

function dataPointMoment(dataPoint) {
  return benchmarkPeriodToMoment(dataPoint.benchmark_period_key, dataPoint.benchmark_school_year);
}


