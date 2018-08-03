import moment from 'moment';

export function toMomentFromRailsDate(railsDateString) {
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

  const trimmedDate = railsDateString.slice(0, 10);

  return moment.utc(trimmedDate, 'YYYY-MM-DD');
}

export function toMomentFromRailsDateTime(railsDateTimeString) {
  // In this function we want to parse time as well

  const trimmedDate = railsDateTimeString.slice(0, 19);

  return moment.utc(trimmedDate);
}
