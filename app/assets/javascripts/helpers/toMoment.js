import moment from 'moment';


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

export function toMomentFromTimestamp(railsDateTimeString) {
  return moment.utc(railsDateTimeString, allowedTimeFormats, true); // this does 'strict parsing' on multiple formats
}

export function toMomentFromRailsDate(railsDateTimeString) {
  // Parse moment from client-side serialized Rails timestamp.
  //
  // In the Rails database, created_at dates look like this:
  //
  // => "Tue, 13 Feb 2018 15:55:56 UTC +00:00"
  //
  // When these dates get rendered as JSON, they get to the client side
  // looking like this:
  //
  // => "2018-02-13T22:17:30.338Z"
  //
  // So to parse the date string, we need to take the first 10 characters
  // (excluding time zone info and minute/second) and then parse
  // from the serialized timestamp format to a moment object.

  const trimmedDate = railsDateTimeString.slice(0, 10);

  return moment.utc(trimmedDate, 'YYYY-MM-DD');
}