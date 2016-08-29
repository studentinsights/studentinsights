(function() {
  window.shared || (window.shared = {});

  var QuadConverter = window.shared.QuadConverter = {
    // A quad is a 4-element array of numbers that represents numerical data on a given date.
    // The first three elements are (year, month, date) and the last is the value.
    // Months are 1-indexed (the way humans write months) and not 0-indexed like Date.getMonth.

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

    // These functions are provided for constructing quads.
    fromMoment: function(momentObj, value){
      var year = momentObj.year();
      var month = momentObj.month() + 1;
      var date = momentObj.date();
      return [year, month, date, value];
    },

    // Utility functions.
    toSchoolYear: function(date) {
      // date: A JS date object or Moment object.
      // returns: Integer representing what the calendar year was in the fall of date's school year.
      var momentObject = moment.utc(date);

      var year = momentObject.year();
      var startOfSchoolYear = this.toMoment([year, 8, 15]);
      var isEventDuringFall = momentObject.diff(startOfSchoolYear, 'days') > 0;
      return (isEventDuringFall) ? year : year - 1;
    },

    // Takes an array of attendanceEvent objects.
    // Returns an array of quads, each representing the first of the month, with a value equal to the number of
    // events that happened in that month.
    cumulativeByMonthFromEvents: function(attendanceEvents) {
      var groupedByMonth = _.groupBy(attendanceEvents, function(event){
        return moment.utc(event.occurred_at).startOf('month').toISOString();
      });

      // result is an array of quads, one quad per month.
      result = [];
      _.each(groupedByMonth, function(value, key){
        result.push(QuadConverter.fromMoment(moment.utc(key), value.length));
      });

      // sort chronologically.
      return _.sortBy(result, QuadConverter.toMoment.bind(this));
    },
  };
})();
