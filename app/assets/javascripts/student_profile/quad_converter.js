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

    fromMoment: function(momentObj, value){
      var year = momentObj.year();
      var month = momentObj.month() + 1;
      var date = momentObj.date();
      return [year, month, date, value];
    },

    toSchoolYear: function(date) {
      // date: A JS date object or Moment object.
      // returns: Integer representing what the calendar year was in the fall of date's school year.
      var momentObject = moment.utc(date);

      var year = momentObject.year();
      var startOfSchoolYear = this.toMoment([year, 8, 15]);
      var isEventDuringFall = momentObject.diff(startOfSchoolYear, 'days') > 0;
      return (isEventDuringFall) ? year : year - 1;
    }
  };
})();
