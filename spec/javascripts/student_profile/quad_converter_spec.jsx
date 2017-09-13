describe('QuadConverter', () => {
  const QuadConverter = window.shared.QuadConverter;

  describe('#toDate', () => {
    it('works', () => {
      const result = QuadConverter.toDate([2015, 7, 2, 42]);
      expect(result instanceof Date).toEqual(true);
      expect(result.toUTCString()).toEqual('Thu, 02 Jul 2015 00:00:00 GMT');
    });
  });

  describe('#toMoment', () => {
    it('works', () => {
      const result = QuadConverter.toMoment([2015, 7, 2, 42]);
      expect(result instanceof moment).toEqual(true);
      expect(result.toString()).toEqual('Thu Jul 02 2015 00:00:00 GMT+0000');
    });
  });

  describe('#toSchoolYear', () => {
    it('works with JS Date objects', () => {
      expect(QuadConverter.toSchoolYear(moment.utc('2014-08-19').valueOf())).toEqual(2014);
      expect(QuadConverter.toSchoolYear(moment.utc('2013-09-12').valueOf())).toEqual(2013);
    });

    it('works with Moment objects', () => {
      expect(QuadConverter.toSchoolYear(moment.utc('2014-11-19'))).toEqual(2014);
      expect(QuadConverter.toSchoolYear(moment.utc('2014-05-12'))).toEqual(2013);
    });
  });

  describe('#firstDayOfSchool', () => {
    it('works', () => {
      expect(QuadConverter.firstDayOfSchool(2016).isSame(moment.utc('2016-08-15'))).toEqual(true);
      expect(QuadConverter.firstDayOfSchool(2013).isSame(moment.utc('2013-08-15'))).toEqual(true);
    });
  });

  describe('#schoolYearStartDates', () => {
    it('works', () => {
      // TODO: Write a Jasmine custom matcher for this?
      const toISOString = function (m) { return m.toISOString(); };
      expect(
        QuadConverter.schoolYearStartDates([moment.utc('2013-10-11'), moment.utc('2017-05-01')])
        .map(toISOString)
      ).toEqual(
        [
          moment.utc('2013-08-15'),
          moment.utc('2014-08-15'),
          moment.utc('2015-08-15'),
          moment.utc('2016-08-15')
        ].map(toISOString)
      );
    });
  });
});
