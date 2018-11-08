import _ from 'lodash';

/*
Functions for transforming the feed data structure that holds
all notes and services for a student.
*/

// Merges data from event_notes and deprecated tables (notes, interventions).
export function mergedNotes(feed) {
  const deprecatedInterventions = feed.deprecated.interventions.map(intervention => {
    return {
      ...intervention,
      type: 'deprecated_interventions',
      sort_timestamp: intervention.start_date_timestamp
    };
  });

  const eventNotes = feed.event_notes.map(eventNote => {
    return {
      ...eventNote,
      type: 'event_notes',
      sort_timestamp: eventNote.recorded_at
    };
  });

  // optional
  const transitionNotes = (feed.transition_notes || []).map(transitionNote => {
    return {
      ...transitionNote,
      type: 'transition_notes',
      sort_timestamp: transitionNote.created_at
    };
  });

  // SHS
  const homeworkHelpSessions = (feed.homework_help_sessions || []).map(homeworkHelpSession => {
    return {
      ...homeworkHelpSession,
      type: 'homework_help_sessions',
      sort_timestamp: homeworkHelpSession.form_timestamp
    };
  });

  const mergedNotes = [
    ...eventNotes,
    ...deprecatedInterventions,
    ...transitionNotes,
    ...homeworkHelpSessions
  ];
  return _.sortBy(mergedNotes, 'sort_timestamp').reverse();
}
