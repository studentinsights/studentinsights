// Allow a few strict formats of dates
const allowedFormats = [
  'MM/DD/YYYY',
  'MM/D/YYYY',
  'M/DD/YYYY',
  'M/D/YYYY',

  'MM/DD/YY',
  'MM/D/YY',
  'M/DD/YY',
  'M/D/YY',

  'MM-DD-YYYY',
  'MM-D-YYYY',
  'M-DD-YYYY',
  'M-D-YYYY',

  'MM-DD-YY',
  'MM-D-YY',
  'M-DD-YY',
  'M-D-YY'
];

// This will always return a `moment` but if `dateText` can't be parsed, that moment will return false
// when you call `isValid`.
export function toMoment(dateText) {
  return moment.utc(dateText, allowedFormats, true); // this does 'strict parsing' on multiple formats
}

const allowedTimeFormats = [
  'YYYY-MM-DDTHH:mm:ss.SSSZ'
];

export function toMomentFromTime(dateText) {
  return moment.utc(dateText, allowedTimeFormats, true); // this does 'strict parsing' on multiple formats
}