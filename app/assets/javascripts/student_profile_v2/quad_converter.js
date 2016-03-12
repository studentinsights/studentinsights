(function() {
  window.shared || (window.shared = {});

  var QuadConverter = window.shared.QuadConverter = {
    toMoment: function(quad) {
      return moment.utc([quad[0], quad[1], quad[2]].join('-'), 'YYYY-M-D');
    },

    toDate: function(quad) {
      return QuadConverter.toMoment(quad).toDate();
    },

    // Fills in data points for start of the school year (8/15) and for current day.
    // Also collapses multiple events on the same day.
    convertAttendanceEvents: function(attendanceEvents, nowDate, dateRange) {
      var currentYearStart = this.schoolYearStart(moment.utc(nowDate));
      var schoolYearStarts = this._allSchoolYearStarts(dateRange);
      var sortedAttendanceEvents = _.sortBy(attendanceEvents, 'occurred_at');

      var quads = [];
      schoolYearStarts.sort().forEach(function(schoolYearStart) {
        var yearAttendanceEvents = sortedAttendanceEvents.filter(function(attendanceEvent) {
          return this.schoolYearStart(moment.utc(attendanceEvent.occurred_at)) === schoolYearStart;
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

    schoolYearStart: function(eventMoment) {
      var year = eventMoment.year();
      var startOfSchoolYear = this.toMoment([year, 8, 15]);
      var isEventDuringFall = eventMoment.clone().diff(startOfSchoolYear, 'days') > 0;
      return (isEventDuringFall) ? year : year - 1;
    },

    _allSchoolYearStarts: function(dateRange) {
      var schoolYearStarts = dateRange.map(function(date) {
        return this.schoolYearStart(moment.utc(date));
      }, this);
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
