import {toMomentFromTime} from '../helpers/toMoment';

// Returns a student's age in years
export function studentAge(nowMoment, dateOfBirthText) {
  const birthMoment = toMomentFromTime(dateOfBirthText);
  return nowMoment.clone().diff(birthMoment, 'year');
}
