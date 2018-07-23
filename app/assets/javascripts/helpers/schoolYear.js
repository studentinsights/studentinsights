import moment from 'moment';

function toMoment(quad) {
  return moment.utc([quad[0], quad[1], quad[2]].join('-'), 'YYYY-M-D');
}

// Returns moment representing the first day of school for a given moment.
export function firstDayOfSchoolForMoment(someMoment) {
  const year = toSchoolYear(someMoment.toDate());
  return firstDayOfSchool(year);
}

// date: A JS date object or Moment object.
// returns: Integer representing what the calendar year was in the fall of date's school year.
export function toSchoolYear(date) {
  const momentObject = moment.utc(date);

  const year = momentObject.year();
  const startOfSchoolYear = toMoment([year, 8, 15]);
  const isEventDuringFall = momentObject.diff(startOfSchoolYear, 'days') > 0;
  return (isEventDuringFall) ? year : year - 1;
}

// year: An integer year.
// returns: A moment object representing the first day of the school year that year starts.
export function firstDayOfSchool(year) {
  return toMoment([year, 8, 15]);
}

// year: An integer year.
// returns: A moment object representing roughly the last day of that school year (which will
// be in the following calendar year).
export function lastDayOfSchool(year) {
  return toMoment([year + 1, 6, 30]);
}
