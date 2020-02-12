import _ from 'lodash';
import {DIBELS_LNF} from './thresholds';
import {
  bucketForDibels,
  rankBenchmarkDataPoint,
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
