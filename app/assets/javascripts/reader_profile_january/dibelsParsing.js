import _ from 'lodash';
import {adjustedGrade} from '../helpers/gradeText';
import {somervilleReadingThresholdsFor} from '../reading/thresholds';
import {benchmarkPeriodToMoment} from '../reading/readingData';


// Get most recent data point, regardless of time.
export function mostRecentDataPoint(readerJson, benchmarkAssessmentKey) {
  const benchmarkDataPoints = readerJson.benchmark_data_points.filter(d => d.benchmark_assessment_key === benchmarkAssessmentKey);
  return _.last(benchmarkDataPoints.map(dataPoint => {
    return benchmarkPeriodToMoment(dataPoint.benchmark_period_key, dataPoint.benchmark_school_year);
  }));
}

// Decide whether to highlight based on thresholds; returns true|false|null.
export function shouldHighlight(dataPoint, gradeNow, nowMoment) {
  const gradeThen = adjustedGrade(dataPoint.benchmark_school_year, gradeNow, nowMoment);
  const thresholds = somervilleReadingThresholdsFor(...[
    dataPoint.benchmark_assessment_key,
    gradeThen,
    dataPoint.benchmark_period_key
  ]);
  return (thresholds && thresholds.benchmark !== undefined)
    ? dataPoint.json.value < thresholds.benchmark
    : null;
}
