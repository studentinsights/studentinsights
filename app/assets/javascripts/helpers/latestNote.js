import _ from 'lodash';
import moment from 'moment';


// Returns latest {event_note_type_id, recorded_at}, sorted by recorded_at time
// or null
function latestNote(eventNotes, eventNoteTypeId) {
  const sortedEventNotes = _.sortBy(eventNotes, note => new Date(note.recorded_at));
  return _.findLast(sortedEventNotes, { event_note_type_id: eventNoteTypeId });
}

function noteDateText(eventNote) {
  if (eventNote === undefined) return null;
  return moment.utc(eventNote.recorded_at).format('M/D/YY');
}

// Merge in info about latest notes into 
export function mergeLatestNoteFields(initialStudent, eventNotes, eventNoteTypeIds) {
  return eventNoteTypeIds.reduce((student, eventNoteTypeId) => {
    const eventNote = latestNote(eventNotes, eventNoteTypeId);
    const dateText = noteDateText(eventNote);
    return {
      ...student,
      [`latest_note_${eventNoteTypeId}`]: {eventNoteTypeId, dateText}
    };
  }, initialStudent);
}

