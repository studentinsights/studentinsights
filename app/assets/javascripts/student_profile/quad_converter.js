(function() {
  window.shared || (window.shared = {});

  var QuadConverter = window.shared.QuadConverter = {
    // A quad is a 4-element array of numbers that represents numerical data on a given date.
    // The first three elements are (year, month, date) and the last is the value.

    // These functions are provided for getting data out of quads.
    toMoment: function(quad) {
      return moment.utc([quad[0], quad[1], quad[2]].join('-'), 'YYYY-M-D');
    },

    toDate: function(quad) {
      return QuadConverter.toMoment(quad).toDate();
    },

    toValue: function(quad) {
      return quad[3];
    },

    toPair: function(quad){
      return [QuadConverter.toMoment(quad).valueOf(), QuadConverter.toValue(quad)];
    },

    // Fills in data points for start of the school year (8/15) and for current day.
    // Also collapses multiple events on the same day.
    convertAttendanceEvents: function(attendanceEvents, nowDate, dateRange) {
      var currentYearStart = this.toSchoolYear(nowDate);
      var schoolYearStarts = this._allSchoolYearStarts(dateRange);
      var sortedAttendanceEvents = _.sortBy(attendanceEvents, 'occurred_at');

      var quads = [];
      schoolYearStarts.sort().forEach(function(schoolYearStart) {
        var yearAttendanceEvents = sortedAttendanceEvents.filter(function(attendanceEvent) {
          return this.toSchoolYear(attendanceEvent.occurred_at) === schoolYearStart;
        }, this);
        var cumulativeEventQuads = this._toCumulativeQuads(yearAttendanceEvents);
        var startOfYearQuad = [schoolYearStart, 8, 15, 0];
        quads.push(startOfYearQuad);
        cumulativeEventQuads.forEach(function(cumulativeQuad) { quads.push(cumulativeQuad); });
        var lastValue = (cumulativeEventQuads.length === 0) ? 0 : _.last(cumulativeEventQuads)[3];
        if (schoolYearStart === currentYearStart) {
          quads.push([nowDate.getFullYear(), nowDate.getMonth() + 1, nowDate.getDate(), lastValue]);
        }
      }, this);

      return _.sortBy(quads, this.toMoment.bind(this));
    },

    schoolYearStartDates: function(dateRange){
      // dateRange: A 2-element array of Moment objects.
      // returns: An array of Moment objects representing the start dates of each school year in the calendar year range.
      return QuadConverter._allSchoolYearStarts(dateRange)
            .map(QuadConverter.firstDayOfSchool);
    },

    firstDayOfSchool: function(year){
      // year: An integer year.
      // returns: A moment object representing the first day of the school year that year starts.
      return QuadConverter.toMoment([year, 8, 15]);
    },

    toSchoolYear: function(date) {
      // date: A JS date object or Moment object.
      // returns: Integer representing what the calendar year was in the fall of date's school year.
      var momentObject = moment.utc(date);

      var year = momentObject.year();
      var startOfSchoolYear = QuadConverter.toMoment([year, 8, 15]);
      var isEventDuringFall = momentObject.diff(startOfSchoolYear, 'days') > 0;
      return (isEventDuringFall) ? year : year - 1;
    },

    _allSchoolYearStarts: function(dateRange) {
      // dateRange: A 2-element array of Moment objects.
      // returns: An array of integers, each school year in the range.
      var schoolYearStarts = _.map(dateRange, QuadConverter.toSchoolYear);
      return _.range(schoolYearStarts[0], schoolYearStarts[1] + 1);
    },

    _toCumulativeQuads: function(yearAttendanceEvents) {
      var cumulativeValue = 0;
      var quads = [];
      _.sortBy(yearAttendanceEvents, 'occurred_at').forEach(function(attendanceEvent) {
        var occurrenceMoment = moment.utc(attendanceEvent.occurred_at);
        cumulativeValue = cumulativeValue + 1;
        
        // collapse consecutive events on the same day
        var lastQuad = _.last(quads);
        var year = occurrenceMoment.year();
        var month = occurrenceMoment.month() + 1;
        var date = occurrenceMoment.date();
        if (lastQuad && lastQuad[0] === year && lastQuad[1] === month && lastQuad[2] === date) {
          lastQuad[3] = cumulativeValue;
        } else {
          quads.push([year, month, date, cumulativeValue]);
        }
      });

      return quads;
    }
  };
})();
