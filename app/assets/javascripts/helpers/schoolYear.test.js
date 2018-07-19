import moment from 'moment';
import {
  toSchoolYear,
  firstDayOfSchool,
  lastDayOfSchool,
} from './schoolYear';


describe('#toSchoolYear', () => {
  it('works with JS Date objects', () => {
    expect(toSchoolYear(moment.utc('2014-08-19').valueOf())).toEqual(2014);
    expect(toSchoolYear(moment.utc('2013-09-12').valueOf())).toEqual(2013);
  });

  it('works with Moment objects', () => {
    expect(toSchoolYear(moment.utc('2014-11-19'))).toEqual(2014);
    expect(toSchoolYear(moment.utc('2014-05-12'))).toEqual(2013);
  });
});

describe('#firstDayOfSchool', () => {
  it('works', () => {
    expect(firstDayOfSchool(2016).isSame(moment.utc("2016-08-15"))).toEqual(true);
    expect(firstDayOfSchool(2013).isSame(moment.utc("2013-08-15"))).toEqual(true);
  });
});

describe('#lastDayOfSchool', () => {
  it('works', () => {
    expect(lastDayOfSchool(2016).isSame(moment.utc("2017-06-30"))).toEqual(true);
    expect(lastDayOfSchool(2013).isSame(moment.utc("2014-06-30"))).toEqual(true);
  });
});