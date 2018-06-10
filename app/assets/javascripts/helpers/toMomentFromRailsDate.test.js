import {toMomentFromRailsDate} from './toMomentFromRailsDate';

it('#toMomentFromRailsDate and then back to text', () => {
  const dateToMoment = toMomentFromRailsDate('2018-02-13T22:17:30.338Z');

  expect(dateToMoment.format('MM/DD/YYYY')).toEqual('02/13/2018');
});
