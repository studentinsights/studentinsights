import _ from 'lodash';

/*
Functions for transforming the feed data structure that holds
all notes and services for a student.
*/

// Returns a list of monthKeys that are within the time window for this chart.
export function monthKeys(nowMomentUTC, monthsBack) {
  const lastMonthMomentUTC = nowMomentUTC.clone().date(1);
  return _.range(monthsBack, -1, -1).map(function(monthsBack) {
    const monthMomentUTC = lastMonthMomentUTC.clone().subtract(monthsBack, 'months');
    const monthKey = monthMomentUTC.format('YYYYMMDD');
    return monthKey;
  }, this);
}

// A function that grabs a monthKey from an event that is passed in.  Should return
// a string in the format YYYYMMDD for the first day of the month.
// Used for grouping events on the chart.
export function defaultMonthKey(event) {
  return moment.utc(event.occurred_at).date(1).format('YYYYMMDD');
}

// Given a list of monthKeys, map over that to return a list of all events that fall within
// that month.
export function eventsToMonthBuckets(monthKeys, events) {
  const eventsByMonth = _.groupBy(events, this.defaultMonthKey);
  return monthKeys.map(function(monthKey) {
    return eventsByMonth[monthKey] || [];
  });
}

// Returns HighCharts categories map, which describes how to place year captions in relation
// to the list of monthKeys.  Returns a map of (index into monthKeys array) -> (caption text)
//
// Example output: {3: '2014', 15: '2015'}
export function yearCategories(monthKeys) {
  let categories = {};

  monthKeys.forEach(function(monthKey, monthKeyIndex) {
    const monthMomentUTC = moment.utc(monthKey);
    const isFirstMonthOfYear = (monthMomentUTC.date() === 1 && monthMomentUTC.month() === 0);
    if (isFirstMonthOfYear) {
      categories[monthKeyIndex] = this.yearAxisCaption(monthKey);
    }
  }, this);

  return categories;
}

export function yearAxisCaption(monthKey) {
  return moment.utc(monthKey).format('YYYY');
}

export function monthAxisCaption(monthKey) {
  return moment.utc(monthKey).format('MMM');
}

export function dateTitle(endDate, monthsBack) {
  const startDate = endDate.clone().subtract(monthsBack,'months');
  return "(" + startDate.format("MM/YYYY") + " to " + endDate.format("MM/YYYY") + ")";
}
