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

  describe('#cumulativeByMonthFromEvents', function(){
    it('works', function(){
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
