import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
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
import HoverSummary, {thresholdsExplanation, secondLineMonthsAgo} from './HoverSummary';
import Tooltip from './Tooltip';
import Freshness from './Freshness';
import {TwoLineChip} from './layout';
import {Concern} from './containers';


// TODO(kr) unroll to show historical
// TODO(kr) schoolYear/gradeThen?
export default class ChipForDibels extends React.Component {
  render() {
    const nowMoment = this.context.nowFn();
    const {student, benchmarkDataPoints} = this.props;

    // pick latest
    const dataPoints = benchmarkDataPoints || [];
    const mostRecentDataPoint = _.last(_.sortBy(dataPoints, d => {
      const assessmentMoment = dataPointMoment(d);
      return (assessmentMoment) ? assessmentMoment.unix() : Number.MIN_VALUE;
    }));
    if (!mostRecentDataPoint) return null;

    // interpret
    const {
      prettyAssessmentText,
      score,
      atMoment,
      gradeThen,
      thresholds,
      concernKey
    } = statsForDataPoint(...[
      mostRecentDataPoint,
      student.grade,
      nowMoment
    ]);
    const daysAgo = atMoment ? nowMoment.clone().diff(atMoment, 'days') : null;
    const WIDTH_THRESHOLD_PIXELS = 80;
    return (
      <Freshness daysAgo={daysAgo}>
        <Concern concernKey={concernKey}>
          <Tooltip tooltipStyle={{minWidth: 400}} title={
            <HoverSummary
              name={prettyAssessmentText}
              atMoment={atMoment}
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
              secondLine={({width}) => secondLineMonthsAgo(daysAgo, width)}
            />
          </Tooltip>
        </Concern>
      </Freshness>
    );
  }
}
ChipForDibels.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
ChipForDibels.propTypes = {
  student: PropTypes.object.isRequired,
  benchmarkDataPoints: PropTypes.array.isRequired
};

function dataPointMoment(dataPoint) {
  return benchmarkPeriodToMoment(dataPoint.benchmark_period_key, dataPoint.benchmark_school_year);
}


export function statsForDataPoint(dataPoint, gradeNow, nowMoment) {
  // guess as grade at time of assessment
  const gradeThen = adjustedGrade(dataPoint.benchmark_school_year, gradeNow, nowMoment);

  // determine color
  const dibelsBucket = bucketForDibels(...[
    dataPoint.json.value,
    dataPoint.benchmark_assessment_key,
    gradeThen,
    dataPoint.benchmark_period_key
  ]);
  const concernKey = {
    [DIBELS_GREEN]: 'low',
    [DIBELS_YELLOW]: 'medium',
    [DIBELS_RED]: 'high',
    [DIBELS_UNKNOWN]: 'unknown'
  }[dibelsBucket];

  // also show cut points
  const thresholds = somervilleReadingThresholdsFor(...[
    dataPoint.benchmark_assessment_key,
    gradeThen,
    dataPoint.benchmark_period_key
  ]);

  // score, name, date
  const score = dataPoint.json.value;
  const prettyAssessmentText = prettyDibelsText(dataPoint.benchmark_assessment_key);
  const atMoment = dataPointMoment(dataPoint);

  return {
    id: dataPoint.id,
    benchmarkPeriodKey: dataPoint.benchmark_period_key,
    schoolYear: dataPoint.benchmark_school_year,
    prettyAssessmentText,
    score,
    atMoment,
    gradeThen,
    thresholds,
    concernKey
  };
}
