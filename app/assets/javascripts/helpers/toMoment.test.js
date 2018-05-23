import {toMomentFromTime, toMomentFromUserInput, toMomentFromRailsDate} from './toMoment.js';

it('#toMomentFromUserInput, then back to same text', () => {
  expect(toMomentFromUserInput('12/19/2018').format('YYYY-MM-DD')).toEqual('2018-12-19');
  expect(toMomentFromUserInput('3/5/2018').format('YYYY-MM-DD')).toEqual('2018-03-05');
  expect(toMomentFromUserInput('1/15/18').format('YYYY-MM-DD')).toEqual('2018-01-15');
  expect(toMomentFromUserInput('01/5/18').format('YYYY-MM-DD')).toEqual('2018-01-05');
  expect(toMomentFromUserInput('01-5-18').format('YYYY-MM-DD')).toEqual('2018-01-05');
});


it('#toMomentFromRailsDate and then back to text', () => {
  const dateToMoment = toMomentFromRailsDate('2018-02-13T22:17:30.338Z');
  expect(dateToMoment.format('MM/DD/YYYY')).toEqual('02/13/2018');
});
