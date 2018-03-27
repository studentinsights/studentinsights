import {
  toDate,
  toMoment,
  toSchoolYear,
  firstDayOfSchool,
  lastDayOfSchool,
  schoolYearStartDates
} from './QuadConverter';

describe('QuadConverter', function() {
  describe('#toDate', function() {
    it('works', function() {
      const result = toDate([2015, 7, 2, 42]);
      expect(result instanceof Date).toEqual(true);
      expect(result.toUTCString()).toEqual('Thu, 02 Jul 2015 00:00:00 GMT');
    });
  });

  describe('#toMoment', function() {
    it('works', function() {
      const result = toMoment([2015, 7, 2, 42]);
      expect(result instanceof moment).toEqual(true);
      expect(result.toString()).toEqual('Thu Jul 02 2015 00:00:00 GMT+0000');
    });
  });

  describe('#toSchoolYear', function() {
    it('works with JS Date objects', function() {
      expect(toSchoolYear(moment.utc('2014-08-19').valueOf())).toEqual(2014);
      expect(toSchoolYear(moment.utc('2013-09-12').valueOf())).toEqual(2013);
    });

    it('works with Moment objects', function() {
      expect(toSchoolYear(moment.utc('2014-11-19'))).toEqual(2014);
      expect(toSchoolYear(moment.utc('2014-05-12'))).toEqual(2013);
    });
  });

  describe('#firstDayOfSchool', function() {
    it('works', function() {
      expect(firstDayOfSchool(2016).isSame(moment.utc("2016-08-15"))).toEqual(true);
      expect(firstDayOfSchool(2013).isSame(moment.utc("2013-08-15"))).toEqual(true);
    });
  });

  describe('#lastDayOfSchool', function() {
    it('works', function() {
      expect(lastDayOfSchool(2016).isSame(moment.utc("2017-06-30"))).toEqual(true);
      expect(lastDayOfSchool(2013).isSame(moment.utc("2014-06-30"))).toEqual(true);
    });
  });

  describe('#schoolYearStartDates', function(){
    it('works', function() {
      // TODO: Write a Jasmine custom matcher for this?
      const toISOString = function(m){return m.toISOString(); };
      expect(
        schoolYearStartDates([moment.utc("2013-10-11"), moment.utc("2017-05-01")])
        .map(toISOString)
      ).toEqual(
        [
          moment.utc("2013-08-15"),
          moment.utc("2014-08-15"),
          moment.utc("2015-08-15"),
          moment.utc("2016-08-15")
        ].map(toISOString)
      );

    });
  });
});
