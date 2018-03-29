import _ from 'lodash';

// Find the latest event note of a particular type, and return a string
// of that date.
export function latestNoteDateText(eventNoteTypeId, eventNotes) {
  const sortedEventNotes = _.sortBy(eventNotes, note => new Date(note.recorded_at));
  const latestNoteOfType = _.findLast(sortedEventNotes, { event_note_type_id: eventNoteTypeId });
  if (latestNoteOfType === undefined) return null;
  return moment.utc(latestNoteOfType.recorded_at).format('M/D/YY');
}