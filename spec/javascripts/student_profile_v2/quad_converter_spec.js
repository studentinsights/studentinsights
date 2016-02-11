describe('QuadConverter', function() {
  var QuadConverter = window.shared.QuadConverter;

  describe('#schoolYearStart', function() {
    it('aligns to school year', function() {
      expect(QuadConverter.schoolYearStart(moment('2013-09-12'))).toEqual(2013);
      expect(QuadConverter.schoolYearStart(moment('2014-05-12'))).toEqual(2013);
      expect(QuadConverter.schoolYearStart(moment('2014-08-19'))).toEqual(2014);
      expect(QuadConverter.schoolYearStart(moment('2014-11-19'))).toEqual(2014);
    });
  });

  describe('#convert', function() {
    it('returns the expected javascript date', function() {
      var now = new Date('Wed Feb 10 2016 22:11:26 GMT-0500 (EST)');
      var dateRange = [moment(now).subtract(1, 'year').toDate(), now];
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
        {'occurred_at':'2015-09-08T00:00:00.000'}
      ];
      var quads = QuadConverter.convert(attendanceEvents, now, dateRange);
      expect(quads[0]).toEqual([2014, 8, 15, 0]);
      expect(quads[1]).toEqual([2015, 8, 15, 0]);
      expect(quads[2]).toEqual([2015, 9, 8, 1]);
      expect(quads.length).toEqual(2 + attendanceEvents.length + 1);
      expect(_.last(quads)[3]).toEqual(15);

      var values = quads.map(function(quad) { return quad[3]; });
      expect(values).toEqual(_.sortBy(values));
    });
  });
});