import _ from 'lodash';
import moment from 'moment';

// Find the latest event note of a particular type, and return a string
// of that date.

// TODO (ARS): Sometimes we want to use this function on a list of notes that
// all have the same event_note_type. In that case we just want to use the sorting
// and text formatting functions here. We could switch the order of the arguments
// passed in and make eventNoteTypeId an optional second argument.

export function latestNoteDateText(eventNoteTypeId, eventNotes) {
  const sortedEventNotes = _.sortBy(eventNotes, note => new Date(note.recorded_at));
  const latestNoteOfType = _.findLast(sortedEventNotes, { event_note_type_id: eventNoteTypeId });
  if (latestNoteOfType === undefined) return null;
  return moment.utc(latestNoteOfType.recorded_at).format('M/D/YY');
}
