import {toMoment, toMomentFromTime} from './toMoment.js';

it('#toMoment and then back to text', () => {
  expect(toMoment('12/19/2018').format('YYYY-MM-DD')).toEqual('2018-12-19');
  expect(toMoment('3/5/2018').format('YYYY-MM-DD')).toEqual('2018-03-05');
  expect(toMoment('1/15/18').format('YYYY-MM-DD')).toEqual('2018-01-15');
  expect(toMoment('01/5/18').format('YYYY-MM-DD')).toEqual('2018-01-05');
  expect(toMoment('01-5-18').format('YYYY-MM-DD')).toEqual('2018-01-05');
});

it('toMomentFromTime and back to text', () => {
  const fmt = 'M/D/YY hh:mm:ssa';
  expect(toMomentFromTime('2018-03-15T21:25:29.530Z').format(fmt)).toEqual('3/15/18 5:25:29pm');
});