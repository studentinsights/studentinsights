import _ from 'lodash';
import {DIBELS_LNF} from './thresholds';
import {
  interpretFAndPEnglish,
  classifyFAndPEnglish,
  bucketForDibels,
  rankBenchmarkDataPoint,
  DIBELS_RED
} from './readingData';


it('#interpretFAndPEnglish', () => {
  expect(interpretFAndPEnglish('aa')).toEqual('AA');
  expect(interpretFAndPEnglish('a')).toEqual('A');
  expect(interpretFAndPEnglish('A')).toEqual('A');
  expect(interpretFAndPEnglish('A?')).toEqual('A');
  expect(interpretFAndPEnglish('A+')).toEqual('A');
  expect(interpretFAndPEnglish('A +')).toEqual('A');
  expect(interpretFAndPEnglish('Z+')).toEqual('Z'); // Z+ is actually a special case per F&P levels docs, but we're ignoring it for now
  expect(interpretFAndPEnglish('a')).toEqual('A');
  expect(interpretFAndPEnglish('A/B')).toEqual('A');
  expect(interpretFAndPEnglish('A/ B')).toEqual('A');
  expect(interpretFAndPEnglish('a-B')).toEqual('A');
  expect(interpretFAndPEnglish('a - B')).toEqual('A');
  expect(interpretFAndPEnglish('A (indep.)')).toEqual('A');
  expect(interpretFAndPEnglish('a(independent)')).toEqual('A');
  expect(interpretFAndPEnglish('a (instructional)')).toEqual('A');
  expect(interpretFAndPEnglish('C(instructional), independent(B)')).toEqual(null);
  expect(interpretFAndPEnglish('B(independent), instructional(C)')).toEqual(null);
  expect(interpretFAndPEnglish('C(instructional), B (independent)')).toEqual(null);
  expect(interpretFAndPEnglish('C(instructional) - B (independent)')).toEqual(null);
});

describe('#classifyFAndPEnglish', () => {
  it('works for winter kindergarten as test case', () => {
    expect(classifyFAndPEnglish('NR', 'KF', 'winter')).toEqual('low');
    expect(classifyFAndPEnglish('AA', 'KF', 'winter')).toEqual('low');
    expect(classifyFAndPEnglish('A', 'KF', 'winter')).toEqual('low');
    expect(classifyFAndPEnglish('B', 'KF', 'winter')).toEqual('medium');
    expect(classifyFAndPEnglish('C', 'KF', 'winter')).toEqual('high');
    expect(classifyFAndPEnglish('D', 'KF', 'winter')).toEqual('high');
    expect(classifyFAndPEnglish('Z', 'KF', 'winter')).toEqual('high');
    expect(classifyFAndPEnglish('Z+', 'KF', 'winter')).toEqual(null); // ignore Z+ special case for now
  });

  it('works for winter 1st grade as test case', () => {
    expect(classifyFAndPEnglish('NR', '1', 'winter')).toEqual('low');
    expect(classifyFAndPEnglish('AA', '1', 'winter')).toEqual('low');
    expect(classifyFAndPEnglish('B', '1', 'winter')).toEqual('low');
    expect(classifyFAndPEnglish('C', '1', 'winter')).toEqual('low');
    expect(classifyFAndPEnglish('D', '1', 'winter')).toEqual('low');
    expect(classifyFAndPEnglish('E', '1', 'winter')).toEqual('medium');
    expect(classifyFAndPEnglish('F', '1', 'winter')).toEqual('medium');
    expect(classifyFAndPEnglish('G', '1', 'winter')).toEqual('high');
    expect(classifyFAndPEnglish('H', '1', 'winter')).toEqual('high');
    expect(classifyFAndPEnglish('Z+', '1', 'winter')).toEqual(null); // ignore Z+ special case for now
  });
});

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
