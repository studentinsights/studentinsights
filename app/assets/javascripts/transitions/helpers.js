import _ from 'lodash';

export function hasNote(student) {
  return student.second_transition_notes.length > 0;
}

export function isStarred(student) {
  return _.some(student.second_transition_notes, {starred: true});
}