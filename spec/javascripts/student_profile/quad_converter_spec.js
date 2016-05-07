describe('QuadConverter', function() {
  var QuadConverter = window.shared.QuadConverter;

  describe('#toDate', function() {
    it('works', function() {
      var result = QuadConverter.toDate([2015, 7, 2, 42]);
      expect(result instanceof Date).toEqual(true);
      expect(result.toUTCString()).toEqual('Thu, 02 Jul 2015 00:00:00 GMT');
    });
  });

  describe('#toMoment', function() {
    it('works', function() {
      var result = QuadConverter.toMoment([2015, 7, 2, 42]);
      expect(result instanceof moment).toEqual(true);
      expect(result.toString()).toEqual('Thu Jul 02 2015 00:00:00 GMT+0000');
    });
  });

  describe('#toSchoolYear', function() {
    it('works with JS Date objects', function() {
      expect(QuadConverter.toSchoolYear(moment.utc('2014-08-19').valueOf())).toEqual(2014);
      expect(QuadConverter.toSchoolYear(moment.utc('2013-09-12').valueOf())).toEqual(2013);
    });

    it('works with Moment objects', function() {
      expect(QuadConverter.toSchoolYear(moment.utc('2014-11-19'))).toEqual(2014);
      expect(QuadConverter.toSchoolYear(moment.utc('2014-05-12'))).toEqual(2013);
    });
  });

  describe('#firstDayOfSchool', function() {
    it('works', function() {
      expect(QuadConverter.firstDayOfSchool(2016).isSame(moment.utc("2016-08-15"))).toEqual(true);
      expect(QuadConverter.firstDayOfSchool(2013).isSame(moment.utc("2013-08-15"))).toEqual(true);
    });
  });

  describe('#schoolYearStartDates', function(){
    it('works', function() {
      // TODO: Write a Jasmine custom matcher for this?
      var toISOString = function(m){return m.toISOString(); };
      expect(
        QuadConverter.schoolYearStartDates([moment.utc("2013-10-11"), moment.utc("2017-05-01")])
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

  describe('#convertAttendanceEvents', function() {
    it('minimal test case', function() {
      var now = new Date('Wed Feb 10 2016 22:11:26 GMT+0000');
      var dateRange = [moment.utc(now).subtract(1, 'year').toDate(), now];
      var attendanceEvents = [
        {'occurred_at':'2015-09-08T00:00:00.000Z'}
      ];
      var quads = QuadConverter.convertAttendanceEvents(attendanceEvents, now, dateRange);
      expect(quads).toEqual([
        [2014, 8, 15, 0],
        [2015, 8, 15, 0],
        [2015, 9, 8, 1],
        [2016, 2, 10, 1]
      ]);
    });

    it('returns the expected javascript date', function() {
      var now = new Date('Wed Feb 10 2016 22:11:26 GMT+0000');
      var dateRange = [moment.utc(now).subtract(1, 'year').toDate(), now];
      var attendanceEvents = [
        {'occurred_at':'2015-12-22T00:00:00.000Z'},
        {'occurred_at':'2015-12-21T00:00:00.000Z'},
        {'occurred_at':'2015-12-08T00:00:00.000Z'},
        {'occurred_at':'2015-10-16T00:00:00.000Z'},
        {'occurred_at':'2015-10-14T00:00:00.000Z'},
        {'occurred_at':'2015-10-08T00:00:00.000Z'},
        {'occurred_at':'2015-10-07T00:00:00.000Z'},
        {'occurred_at':'2015-10-06T00:00:00.000Z'},
        {'occurred_at':'2015-09-23T00:00:00.000Z'},
        {'occurred_at':'2015-09-22T00:00:00.000Z'},
        {'occurred_at':'2015-09-21T00:00:00.000Z'},
        {'occurred_at':'2015-09-18T00:00:00.000Z'},
        {'occurred_at':'2015-09-17T00:00:00.000Z'},
        {'occurred_at':'2015-09-15T00:00:00.000Z'},
        {'occurred_at':'2015-09-08T00:00:00.000Z'}
      ];
      var quads = QuadConverter.cumulativeByMonthFromEvents(attendanceEvents);
      expect(quads[0]).toEqual([2015, 9, 1, 7]);
      expect(quads[2]).toEqual([2015, 12, 1, 3]);
    });
  });
});
