import moment from 'moment';

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
  const startOfSchoolYear = firstDayOfSchool(year);
  const isEventDuringFall = momentObject.diff(startOfSchoolYear, 'days') > 0;
  return (isEventDuringFall) ? year : year - 1;
}

function toMoment(triple) {
  return moment.utc([triple[0], triple[1], triple[2]].join('-'), 'YYYY-M-D');
}
