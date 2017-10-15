import _ from 'lodash';

(function() {
  window.shared || (window.shared = {});

  /*
  Functions for transforming the feed data structure that holds
  all notes and services for a student.
  */
  window.shared.GraphHelpers = {
    // Returns a list of monthKeys that are within the time window for this chart.
    monthKeys: function(nowMomentUTC, monthsBack) {
      var lastMonthMomentUTC = nowMomentUTC.clone().date(1);
      return _.range(monthsBack, -1, -1).map(function(monthsBack) {
        var monthMomentUTC = lastMonthMomentUTC.clone().subtract(monthsBack, 'months');
        var monthKey = monthMomentUTC.format('YYYYMMDD');
        return monthKey;
      }, this);
    },

    // A function that grabs a monthKey from an event that is passed in.  Should return
    // a string in the format YYYYMMDD for the first day of the month.
    // Used for grouping events on the chart.
    defaultMonthKey: function(event) {
      return moment.utc(event.occurred_at).date(1).format('YYYYMMDD');
    },

    // Given a list of monthKeys, map over that to return a list of all events that fall within
    // that month.
    eventsToMonthBuckets: function(monthKeys, events){
      var eventsByMonth = _.groupBy(events, this.defaultMonthKey);
      return monthKeys.map(function(monthKey) {
        return eventsByMonth[monthKey] || [];
      });
    },


    // Returns HighCharts categories map, which describes how to place year captions in relation
    // to the list of monthKeys.  Returns a map of (index into monthKeys array) -> (caption text)
    //
    // Example output: {3: '2014', 15: '2015'}
    yearCategories: function(monthKeys) {
      var categories = {};

      monthKeys.forEach(function(monthKey, monthKeyIndex) {
        var monthMomentUTC = moment.utc(monthKey);
        var isFirstMonthOfYear = (monthMomentUTC.date() === 1 && monthMomentUTC.month() === 0);
        if (isFirstMonthOfYear) {
          categories[monthKeyIndex] = this.yearAxisCaption(monthKey);
        }
      }, this);

      return categories;
    },

    eventToDays: function(event) {
      //converts events to days for grouping
      return moment.utc(event.occurred_at).format('YYYYMMDD');
    },

    eventsToDayBuckets: function(events) {
      var eventsByDay = _.groupBy(events);
      return eventsByDay;
    },

    yearAxisCaption: function(monthKey) {
      return moment.utc(monthKey).format('YYYY');
    },

    monthAxisCaption: function(monthKey) {
      return moment.utc(monthKey).format('MMM');
    },

    dateTitle: function(endDate, monthsBack) {
      var startDate = endDate.clone().subtract(monthsBack,'months');
      return "(" + startDate.format("MM/YYYY") + " to " + endDate.format("MM/YYYY") + ")";
    }
  };

})();
