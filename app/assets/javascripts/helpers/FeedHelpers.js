import _ from 'lodash';

/*
Functions for transforming the feed data structure that holds
all notes and services for a student.
*/

function highSchoolTransition(note) {
  if (note.type !== 'event_notes') return false;
  if (note.event_note_type_id !== 307) return false;
  return true;
}

// Merges data from event_notes and deprecated tables (notes, interventions).
export function mergedNotes(feed) {
  const deprecatedInterventions = feed.deprecated.interventions.map((intervention) => {
    return {
      ...intervention,
      type: 'deprecated_interventions',
      sort_timestamp: intervention.start_date_timestamp
    };
  });
  const eventNotes = feed.event_notes.map((eventNote) => {
    return {
      ...eventNote,
      type: 'event_notes',
      sort_timestamp: eventNote.recorded_at
    };
  });

  const mergedNotes = eventNotes.concat.apply(eventNotes, [deprecatedInterventions]);

  return mergedNotes.sort((note_a, note_b) => {
    if (highSchoolTransition(note_a) && !highSchoolTransition(note_b)) return -1;
    if (!highSchoolTransition(note_a) && highSchoolTransition(note_b)) return 1;

    if (note_a.sort_timestamp > note_b.sort_timestamp) return -1;
    if (note_a.sort_timestamp < note_b.sort_timestamp) return 1;
    return 0;
  });
}

export function matchesMergedNoteType(mergedNote, mergedNoteType, mergedNoteTypeId) {
  if (mergedNote.type !== mergedNoteType) return false;
  switch (mergedNote.type) {
  case 'event_notes': return (mergedNote.event_note_type_id === mergedNoteTypeId);
  case 'deprecated_interventions': return (mergedNote.intervention_type_id === mergedNoteTypeId);
  }

  return false;
}
