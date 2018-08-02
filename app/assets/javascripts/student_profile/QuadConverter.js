import _ from 'lodash';
import moment from 'moment';
import {
  toSchoolYear,
  firstDayOfSchool
} from '../helpers/schoolYear';
import { toMomentFromRailsDateTime } from '../helpers/toMomentFromRailsDate';

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

// The Sparkline component expects this form; not going to re-write Sparkline
// since student profile is being redesigned. So let's give Sparklines what
// they want for now.
export function toDeprecatedStarQuads(series) {
  return _.uniq(series.map((starResult) => {
    const dateTaken = toMomentFromRailsDateTime(starResult.date_taken);

    return [
      dateTaken.year(),
      dateTaken.month() + 1, // moment months are zero-indexed (https://momentjs.com/docs/#/get-set/month/)
      dateTaken.date(),      // moment `date()` => Ruby `day`
      starResult.percentile_rank,
    ];
  }), (quad) => { [quad[0], quad[1], quad[2]]; });
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

export function toStarObject(starObject) {
  const {date_taken} = starObject;

  return {
    x: toMomentFromRailsDateTime(date_taken).valueOf(),
    y: starObject.percentile_rank,
    gradeLevelEquivalent: starObject.grade_level_equivalent
  };
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

// Takes an array of attendanceEvent objects.
// Returns an array of quads, each representing the first of the month, with a value equal to the number of
// events that happened in that month.
export function cumulativeByMonthFromEvents(attendanceEvents) {
  const groupedByMonth = _.groupBy(attendanceEvents, event => {
    return moment.utc(event.occurred_at).startOf('month').toISOString();
  });

  // result is an array of quads, one quad per month.
  let result = [];

  _.each(groupedByMonth, (value, key) => {
    result.push(fromMoment(moment.utc(key), value.length));
  });

  // sort chronologically.
  return _.sortBy(result, toMoment.bind(this));
}