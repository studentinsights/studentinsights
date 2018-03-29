import {toMoment} from './toMoment.js';

it('#toMoment and then back to text', () => {
  expect(toMoment('12/19/2018').format('YYYY-MM-DD')).toEqual('2018-12-19');
  expect(toMoment('3/5/2018').format('YYYY-MM-DD')).toEqual('2018-03-05');
  expect(toMoment('1/15/18').format('YYYY-MM-DD')).toEqual('2018-01-15');
  expect(toMoment('01/5/18').format('YYYY-MM-DD')).toEqual('2018-01-05');
  expect(toMoment('01-5-18').format('YYYY-MM-DD')).toEqual('2018-01-05');
});