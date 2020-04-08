import _ from 'lodash';
import {DIBELS_LNF} from './thresholds';
import {
  bucketForDibels,
  rankBenchmarkDataPoint,
  shouldHighlightBenchmarkDataPoint,
  DIBELS_RED
} from './readingData';


describe('#bucketForDibels', () => {
  it('works', () => {
    expect(bucketForDibels('0', DIBELS_LNF, '1', 'fall')).toEqual(DIBELS_RED);
  });
});

describe('#rankBenchmarkDataPoint', () => {
  it('works', () => {
    expect(_.orderBy([
      {benchmark_assessment_key: 'f_and_p_english', json: { value: 'Z'}},
      {benchmark_assessment_key: 'f_and_p_english', json: { value: 'NR'}},
      {benchmark_assessment_key: 'f_and_p_english', json: { value: 'not assessed' }},
      {benchmark_assessment_key: 'f_and_p_english', json: { value: 'A'}},
      {benchmark_assessment_key: 'f_and_p_english', json: { value: 'AA'}}
    ], rankBenchmarkDataPoint).map(d => d.json.value)).toEqual([
      'not assessed',
      'NR',
      'AA',
      'A',
      'Z'
    ]);
  });
});


describe('#shouldHighlightBenchmarkDataPoint', () => {
  it('handles F&P level comparisons correctly', () => {
    expect(shouldHighlightBenchmarkDataPoint({
      benchmark_school_year: 2018,
      benchmark_period_key: "fall",
      benchmark_assessment_key: "f_and_p_english",
      json: { value: "b" } // note the lowercase
    }, 'KF')).toEqual(null);
    expect(shouldHighlightBenchmarkDataPoint({
      benchmark_school_year: 2018,
      benchmark_period_key: "spring",
      benchmark_assessment_key: "f_and_p_english",
      json: { value: "b" }
    }, 'KF')).toEqual(true);
    expect(shouldHighlightBenchmarkDataPoint({
      benchmark_school_year: 2018,
      benchmark_period_key: "spring",
      benchmark_assessment_key: "f_and_p_english",
      json: { value: "c" }
    }, 'KF')).toEqual(false);
    expect(shouldHighlightBenchmarkDataPoint({
      benchmark_school_year: 2018,
      benchmark_period_key: "winter",
      benchmark_assessment_key: "f_and_p_english",
      json: { value: "T" }
    }, '4')).toEqual(false);
  });
});