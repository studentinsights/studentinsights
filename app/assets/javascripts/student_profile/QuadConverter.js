import _ from 'lodash';
import moment from 'moment';

// A quad is a 4-element array of numbers that represents numerical data on a given date.
// The first three elements are (year, month, date) and the last is the value.
// Months are 1-indexed (the way humans write months) and not 0-indexed like Date.getMonth.

// These functions are provided for getting data out of quads.
function allSchoolYearStarts(dateRange) {
  // dateRange: A 2-element array of Moment objects.
  // returns: An array of integers, each school year in the range.
  const schoolYearStarts = _.map(dateRange, toSchoolYear);
  return _.range(schoolYearStarts[0], schoolYearStarts[1] + 1);
}


export function toMoment(quad) {
  return moment.utc([quad[0], quad[1], quad[2]].join('-'), 'YYYY-M-D');
}

export function toDate(quad) {
  return toMoment(quad).toDate();
}

export function toValue(quad) {
  return quad[3];
}

export function toPair(quad){
  return [toMoment(quad).valueOf(), toValue(quad)];
}

// The "Star Object" adds an additional data point (4-indexed) to a quad.
// This allows the rendering of gradeLevelEquivalent data in highcharts tooltip
export function toStarObject(quad){
  return {
    x: toMoment(quad).valueOf(),
    y: toValue(quad),
    gradeLevelEquivalent: toGradeLevelEquivalent(quad)
  };
}

export function toGradeLevelEquivalent(quad){
  return quad[4];
}

// These functions are provided for constructing quads.
export function fromMoment(momentObj, value){
  const year = momentObj.year();
  const month = momentObj.month() + 1;
  const date = momentObj.date();
  return [year, month, date, value];
}

export function schoolYearStartDates(dateRange){
  // dateRange: A 2-element array of Moment objects.
  // returns: An array of Moment objects representing the start dates of each school year in the calendar year range.
  return allSchoolYearStarts(dateRange)
        .map(firstDayOfSchool);
}

export function firstDayOfSchool(year){
  // year: An integer year.
  // returns: A moment object representing the first day of the school year that year starts.
  return toMoment([year, 8, 15]);
}

export function lastDayOfSchool(year){
  // year: An integer year.
  // returns: A moment object representing roughly the last day of that school year (which will
  // be in the following calendar year).
  return toMoment([year + 1, 6, 30]);
}

export function toSchoolYear(date) {
  // date: A JS date object or Moment object.
  // returns: Integer representing what the calendar year was in the fall of date's school year.
  const momentObject = moment.utc(date);

  const year = momentObject.year();
  const startOfSchoolYear = toMoment([year, 8, 15]);
  const isEventDuringFall = momentObject.diff(startOfSchoolYear, 'days') > 0;
  return (isEventDuringFall) ? year : year - 1;
}

// Takes an array of attendanceEvent objects.
// Returns an array of quads, each representing the first of the month, with a value equal to the number of
// events that happened in that month.
export function cumulativeByMonthFromEvents(attendanceEvents) {
  const groupedByMonth = _.groupBy(attendanceEvents, function(event){
    return moment.utc(event.occurred_at).startOf('month').toISOString();
  });

  // result is an array of quads, one quad per month.
  let result = [];

  _.each(groupedByMonth, function(value, key){
    result.push(fromMoment(moment.utc(key), value.length));
  });

  // sort chronologically.
  return _.sortBy(result, toMoment.bind(this));
}