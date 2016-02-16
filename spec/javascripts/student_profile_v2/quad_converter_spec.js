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
    it('minimal test case', function() {
      var now = new Date('Wed Feb 10 2016 22:11:26 GMT+0000');
      var dateRange = [moment.utc(now).subtract(1, 'year').toDate(), now];
      var attendanceEvents = [
        {'occurred_at':'2015-09-08T00:00:00.000Z'}
      ];
      var quads = QuadConverter.convert(attendanceEvents, now, dateRange);
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
      var quads = QuadConverter.convert(attendanceEvents, now, dateRange);
      expect(quads[0]).toEqual([2014, 8, 15, 0]);
      expect(quads[1]).toEqual([2015, 8, 15, 0]);
      expect(quads[2]).toEqual([2015, 9, 8, 1]);
      expect(quads.length).toEqual(2 + attendanceEvents.length + 1);
      expect(_.last(quads)[3]).toEqual(15);

      var values = quads.map(function(quad) { return quad[3]; });
      expect(values).toEqual(_.sortBy(values));
    });

    it('always sorts by date', function() {
      var now = new Date('Mon Feb 15 2016 18:19:55 GMT+0000');
      var dateRange = [moment(now).subtract(1, 'year').toDate(), now];
      var tardyEvents = [{"student_school_year_id":304,"occurred_at":"2016-02-11T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2016-02-10T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2016-02-04T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2016-02-02T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2016-02-01T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2016-01-25T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2016-01-19T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2016-01-12T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2016-01-11T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-12-23T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-12-22T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-12-11T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-12-10T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-12-09T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-12-08T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-12-07T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-12-04T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-12-02T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-11-30T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-11-23T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-11-16T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-11-13T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-11-04T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-10-30T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-10-29T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-10-28T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-10-23T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-10-15T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-10-14T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-10-07T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-10-06T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-09-25T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-09-22T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-09-21T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-09-17T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-09-14T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-09-10T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-09-09T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-09-04T00:00:00.000Z"},{"student_school_year_id":304,"occurred_at":"2015-09-03T00:00:00.000Z"}];
      var quads = QuadConverter.convert(tardyEvents, now, dateRange);

      var dates = quads.map(function(quad) {
        var dateString = [quad[0], quad[1], quad[2]].join('-');
        return moment.utc(dateString, 'YYYY-M-D').toDate();
      });
      expect(dates).toEqual(_.sortBy(dates));
      var values = quads.map(function(quad) { return quad[3]; });
      expect(values).toEqual(_.sortBy(values));
    });
  });
});