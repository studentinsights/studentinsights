import {
  toMomentFromTimestamp,
  toMoment,
  toMomentFromRailsDate
} from './toMoment';


it('#toMoment and then back to text', () => {
  expect(toMoment('12/19/2018').format('YYYY-MM-DD')).toEqual('2018-12-19');
  expect(toMoment('3/5/2018').format('YYYY-MM-DD')).toEqual('2018-03-05');
  expect(toMoment('1/15/18').format('YYYY-MM-DD')).toEqual('2018-01-15');
  expect(toMoment('01/5/18').format('YYYY-MM-DD')).toEqual('2018-01-05');
  expect(toMoment('01-5-18').format('YYYY-MM-DD')).toEqual('2018-01-05');
});

describe('#toMomentFromTimestamp', () => {
  it('works as expected because local timezone is set as expected', () => {
    const string = '2018-05-09T12:03:26.664Z';
    expect(toMomentFromTimestamp(string).local().format('dddd M/D, h:mma')).toEqual('Wednesday 5/9, 8:03am');
    expect(toMomentFromTimestamp(string).toDate().toLocaleTimeString()).toEqual('08:03:26');
  });
});


it('#toMomentFromRailsDate and then back to text', () => {
  const dateToMoment = toMomentFromRailsDate('2018-02-13T22:17:30.338Z');

  expect(dateToMoment.format('MM/DD/YYYY')).toEqual('02/13/2018');
});
