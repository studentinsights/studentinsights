import _ from 'lodash';

// Counselor and house names may be stored in different cases for different students.
// This makes them look nice either way.
export function maybeCapitalize(maybeValue) {
  return (maybeValue === null || maybeValue === undefined || !_.isFunction(maybeValue.toLowerCase))
    ? null
    : _.capitalize(maybeValue.toLowerCase());
}
