import _ from 'lodash';
const merge = window.shared.ReactHelpers.merge;

export function mergedNotes(feed) {
  const deprecatedInterventions = feed.deprecated.interventions.map(function(intervention) {
    return merge(intervention, {
      type: 'deprecated_interventions',
      sort_timestamp: intervention.start_date_timestamp
    });
  });
  const eventNotes = feed.event_notes.map(function(eventNote) {
    return merge(eventNote, {
      type: 'event_notes',
      sort_timestamp: eventNote.recorded_at
    });
  });

  const mergedNotes = eventNotes.concat.apply(eventNotes, [deprecatedInterventions]);
  return _.sortBy(mergedNotes, 'sort_timestamp').reverse();
}

export function matchesMergedNoteType(mergedNote, mergedNoteType, mergedNoteTypeId) {
  if (mergedNote.type !== mergedNoteType) return false;
  switch (mergedNote.type) {
  case 'event_notes': return (mergedNote.event_note_type_id === mergedNoteTypeId);
  case 'deprecated_interventions': return (mergedNote.intervention_type_id === mergedNoteTypeId);
  }

  return false;
}
