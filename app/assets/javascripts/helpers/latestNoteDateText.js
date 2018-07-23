import _ from 'lodash';
import moment from 'moment';


// Returns latest {event_note_type_id, recorded_at}, sorted by recorded_at time
// or null
function latestNote(eventNotes, options = {}) {
  const sortedEventNotes = _.sortBy(eventNotes, note => new Date(note.recorded_at));
  return _.last(sortedEventNotes);
}

function noteDateText(eventNote) {
  if (eventNote === undefined) return null;
  return moment.utc(eventNote.recorded_at).format('M/D/YY');
}

// Merge in info about latest notes into 
export function mergeLatestNoteFields(studentWithEventNotes, eventNoteTypeIds) {
  return eventNoteTypeIds.reduce((student, eventNoteTypeId) => {
    const dateText = noteDateText(latestNote(eventNoteTypeId, student.event_notes));
    return {
      ...student,
      [`latest_note_${eventNoteTypeId}`]: {eventNoteTypeId, dateText}
    };
  }, studentWithEventNotes);
}

