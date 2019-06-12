import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {gradeText, adjustedGrade} from '../helpers/gradeText';
import {
  classifyFAndPEnglish,
  benchmarkPeriodToMoment
} from '../reading/readingData';
import {somervilleReadingThresholdsFor} from '../reading/thresholds';
import HoverSummary, {thresholdsExplanation, secondLineMonthsAgo} from './HoverSummary';
import Tooltip from './Tooltip';
import Freshness from './Freshness';
import {TwoLineChip} from './layout';
import {Concern} from './containers';


// TODO(kr) unroll to show historical
// TODO(kr) schoolYear/gradeThen?
export default class ChipForFAndPEnglish extends React.Component {
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
                  : 'F&P';
              }}
              secondLine={({width}) => secondLineMonthsAgo(daysAgo, width)}
            />
          </Tooltip>
        </Concern>
      </Freshness>
    );
  }
}
ChipForFAndPEnglish.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
ChipForFAndPEnglish.propTypes = {
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
  const riskBucket = classifyFAndPEnglish(dataPoint.json.value, gradeThen, dataPoint.benchmark_period_key);
  const concernKey = {
    high: 'low',
    medium: 'medium',
    low: 'high'
  }[riskBucket] || 'unknown';

  // also show cut points
  const thresholds = somervilleReadingThresholdsFor(...[
    dataPoint.benchmark_assessment_key,
    gradeThen,
    dataPoint.benchmark_period_key
  ]);

  // score, name, date
  const score = dataPoint.json.value;
  const atMoment = dataPointMoment(dataPoint);
  const prettyAssessmentText = 'F&P Level';

  return {
    id: dataPoint.id,
    prettyAssessmentText,
    score,
    atMoment,
    gradeThen,
    thresholds,
    concernKey
  };
}
