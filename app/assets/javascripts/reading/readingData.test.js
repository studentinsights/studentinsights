import {
  interpretFAndPEnglish,
  classifyFAndPEnglish
} from './readingData';

it('#interpretFAndPEnglish', () => {
  expect(interpretFAndPEnglish('A')).toEqual('A');
  expect(interpretFAndPEnglish('a')).toEqual('A');
  expect(interpretFAndPEnglish('A/B')).toEqual('A');
  expect(interpretFAndPEnglish('a-B')).toEqual('A');
  expect(interpretFAndPEnglish('a(independent)')).toEqual('A');
  expect(interpretFAndPEnglish('A (indep.)')).toEqual('A');
});

describe('#classifyFAndPEnglish', () => {
  it('works for winter kindergarten as test case', () => {
    expect(classifyFAndPEnglish('NR', 'KF', 'winter')).toEqual('low');
    expect(classifyFAndPEnglish('AA', 'KF', 'winter')).toEqual('low');
    expect(classifyFAndPEnglish('A', 'KF', 'winter')).toEqual('low');
    expect(classifyFAndPEnglish('B', 'KF', 'winter')).toEqual('medium');
    expect(classifyFAndPEnglish('C', 'KF', 'winter')).toEqual('high');
    expect(classifyFAndPEnglish('D', 'KF', 'winter')).toEqual('high');
    expect(classifyFAndPEnglish('Z+', 'KF', 'winter')).toEqual('high');
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
    expect(classifyFAndPEnglish('Z+', '1', 'winter')).toEqual('high');
  });
});