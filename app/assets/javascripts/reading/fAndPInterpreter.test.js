import _ from 'lodash';
import {
  interpretFAndPEnglish,
  classifyFAndPEnglish,
  fAndPOrdering,
  orderedFAndPLevels
} from './fAndPInterpreter';


it('#interpretFAndPEnglish', () => {
  expect(interpretFAndPEnglish('aa')).toEqual('AA');
  expect(interpretFAndPEnglish('a')).toEqual('A');
  expect(interpretFAndPEnglish('A')).toEqual('A');
  expect(interpretFAndPEnglish('A?')).toEqual('A');
  expect(interpretFAndPEnglish('A+')).toEqual('A');
  expect(interpretFAndPEnglish('A +')).toEqual('A');
  expect(interpretFAndPEnglish('Z+')).toEqual('Z'); // Z+ is actually a special case per F&P levels docs, but we're ignoring it for now
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
  it('has no thresholds for fall kindergarten', () => {
    expect(classifyFAndPEnglish('NR', 'KF', 'fall')).toEqual(null);
    expect(classifyFAndPEnglish('Z', 'KF', 'fall')).toEqual(null);
  });
  
  it('has no thresholds for winter kindergarten', () => {
    expect(classifyFAndPEnglish('NR', 'KF', 'winter')).toEqual(null);
    expect(classifyFAndPEnglish('Z', 'KF', 'winter')).toEqual(null);
  });

  it('works for spring kindergarten as test case', () => {
    expect(classifyFAndPEnglish('NR', 'KF', 'spring')).toEqual('medium');
    expect(classifyFAndPEnglish('AA', 'KF', 'spring')).toEqual('medium');
    expect(classifyFAndPEnglish('A', 'KF', 'spring')).toEqual('medium');
    expect(classifyFAndPEnglish('B', 'KF', 'spring')).toEqual('medium');
    expect(classifyFAndPEnglish('C', 'KF', 'spring')).toEqual('high');
    expect(classifyFAndPEnglish('D', 'KF', 'spring')).toEqual('high');
    expect(classifyFAndPEnglish('Z', 'KF', 'spring')).toEqual('high');
    expect(classifyFAndPEnglish('Z+', 'KF', 'spring')).toEqual(null); // ignore Z+ special case for now
  });

  it('works for winter 1st grade as test case', () => {
    expect(classifyFAndPEnglish('NR', '1', 'winter')).toEqual('medium');
    expect(classifyFAndPEnglish('AA', '1', 'winter')).toEqual('medium');
    expect(classifyFAndPEnglish('B', '1', 'winter')).toEqual('medium');
    expect(classifyFAndPEnglish('C', '1', 'winter')).toEqual('medium');
    expect(classifyFAndPEnglish('D', '1', 'winter')).toEqual('medium');
    expect(classifyFAndPEnglish('E', '1', 'winter')).toEqual('medium');
    expect(classifyFAndPEnglish('F', '1', 'winter')).toEqual('high');
    expect(classifyFAndPEnglish('G', '1', 'winter')).toEqual('high');
    expect(classifyFAndPEnglish('H', '1', 'winter')).toEqual('high');
    expect(classifyFAndPEnglish('Z+', '1', 'winter')).toEqual(null); // ignore Z+ special case for now
  });
});


describe('#fAndPOrdering', () => {
  it('works', () => {
    const manuallyOrdered = [
      fAndPOrdering('B(independent), instructional(C)'),
      fAndPOrdering('C(instructional), independent(B)'),
      fAndPOrdering('C(instructional), B (independent)'),
      fAndPOrdering('C(instructional) - B (independent)'),
      fAndPOrdering('NR'),
      fAndPOrdering('A'),
      fAndPOrdering('a'),
      fAndPOrdering('a'),
      fAndPOrdering('A'),
      fAndPOrdering('A?'),
      fAndPOrdering('A+'),
      fAndPOrdering('A +'),
      fAndPOrdering('A/B'),
      fAndPOrdering('A/ B'),
      fAndPOrdering('a-B'),
      fAndPOrdering('a - B'),
      fAndPOrdering('A (indep.)'),
      fAndPOrdering('a(independent)'),
      fAndPOrdering('a (instructional)'),
      fAndPOrdering('C'),
      fAndPOrdering('F'),
      fAndPOrdering('Z+')
    ];
    expect(manuallyOrdered).toEqual(_.orderBy(manuallyOrdered));
  });
});

describe('#orderedFAndPLevels', () => {
  it('returns expected order', () => {
    const levels = orderedFAndPLevels();
    expect(_.first(levels)).toEqual('NR');
    expect(_.last(levels)).toEqual('Z');
    expect(levels.length).toEqual(28);
  });
});