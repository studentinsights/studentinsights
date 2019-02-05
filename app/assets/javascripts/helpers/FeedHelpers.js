import _ from 'lodash';

/*
Functions for transforming the feed data structure that holds
all notes and services for a student.
*/

// Merges data from event_notes and deprecated tables (notes, interventions).
export function mergedNotes(feed) {
  // core, notes
  const eventNotes = feed.event_notes.map(eventNote => {
    return {
      ...eventNote,
      type: 'event_notes',
      sort_timestamp: eventNote.recorded_at
    };
  });

  // deprecated
  const deprecatedInterventions = feed.deprecated.interventions.map(intervention => {
    return {
      ...intervention,
      type: 'deprecated_interventions',
      sort_timestamp: intervention.start_date_timestamp
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

  // SHS only
  const homeworkHelpSessions = (feed.homework_help_sessions || []).map(homeworkHelpSession => {
    return {
      ...homeworkHelpSession,
      type: 'homework_help_sessions',
      sort_timestamp: homeworkHelpSession.form_timestamp
    };
  });

  // SHS only so far
  const fallStudentVoiceInsights = (feed.fall_student_voice_insights || []).map(fallStudentVoiceInsight => {
    console.log('fallStudentVoiceInsight', fallStudentVoiceInsight);
    return {
      ...fallStudentVoiceInsight,
      type: 'fall_student_voice_insights',
      sort_timestamp: fallStudentVoiceInsight.student_voice_completed_survey.form_timestamp
    };
  });

  // flattened form (from ImportedForm)
  const flattenedForms = (feed.flattened_forms || []).map(flattenedForm => {
    return {
      ...flattenedForm,
      type: 'flattened_forms',
      sort_timestamp: flattenedForm.form_timestamp
    };
  });

  const mergedNotes = [
    ...eventNotes,
    ...deprecatedInterventions,
    ...transitionNotes,
    ...homeworkHelpSessions,
    ...fallStudentVoiceInsights,
    ...flattenedForms
  ];
  return _.sortBy(mergedNotes, 'sort_timestamp').reverse();
}
