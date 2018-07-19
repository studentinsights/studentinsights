import _ from 'lodash';
import moment from 'moment';

/*
Functions for transforming the feed data structure that holds
all notes and services for a student.
*/

// Returns a list of monthKeys that are within the time window for this chart.
export function monthKeys(nowMomentUTC, monthsBack) {
  const lastMonthMomentUTC = nowMomentUTC.clone().date(1);
  return _.range(monthsBack, -1, -1).map(monthsBack => {
    const monthMomentUTC = lastMonthMomentUTC.clone().subtract(monthsBack, 'months');
    const monthKey = monthMomentUTC.format('YYYYMMDD');
    return monthKey;
  });
}

// Returns a list of moments for the 1st of each month within the range.
export function firstsOfTheMonthWithinRange(startMoment, endMoment) {
  // Starts on 1st of month based on endMoment, and count back
  var months = []; // eslint-disable-line no-var
  var currentMoment = endMoment.clone().date(1).clone(); // eslint-disable-line no-var
  while (currentMoment.isAfter(startMoment)) {
    months.push(currentMoment);
    currentMoment = currentMoment.subtract(1, 'months');
  }
  return months;
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
  const eventsByMonth = _.groupBy(events, defaultMonthKey);
  return monthKeys.map(monthKey => {
    return eventsByMonth[monthKey] || [];
  });
}

// Returns HighCharts categories map, which describes how to place year captions in relation
// to the list of monthKeys.  Returns a map of (index into monthKeys array) -> (caption text)
//
// Example output: {3: '2014', 15: '2015'}
export function yearCategories(monthKeys) {
  let categories = {};

  monthKeys.forEach((monthKey, monthKeyIndex) => {
    const monthMomentUTC = moment.utc(monthKey);
    const isFirstMonthOfYear = (monthMomentUTC.date() === 1 && monthMomentUTC.month() === 0);
    if (isFirstMonthOfYear) {
      categories[monthKeyIndex] = yearAxisCaption(monthKey);
    }
  });

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
