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

  // deprecated
  const transitionNotes = (feed.transition_notes || []).map(transitionNote => {
    return {
      ...transitionNote,
      type: 'transition_notes',
      sort_timestamp: transitionNote.recorded_at
    };
  });

  // somerville 8th > 9th transition notes 2019 
  const secondTransitionNotes = (feed.second_transition_notes || []).map(secondTransitionNote => {
    return {
      ...secondTransitionNote,
      type: 'second_transition_notes',
      sort_timestamp: secondTransitionNote.recorded_at
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
  const fallStudentVoiceInsights = (feed.fall_student_voice_surveys || []).map(fallCompletedSurvey => {
    return {
      ...fallCompletedSurvey,
      type: 'fall_student_voice_surveys',
      sort_timestamp: fallCompletedSurvey.form_timestamp

    };
  });

  // SHS only. Remote learning responses
  const remoteLearningInsights = (feed.remote_learning_surveys || []).map(completedRemoteLearningSurvey => {
    return {
      ...completedRemoteLearningSurvey,
      type: 'fall_remote_learning_surveys',
      sort_timestamp: completedRemoteLearningSurvey.form_timestamp

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

  // bedford_end_of_year_transitions
  const bedfordEndOfYearTransitions = (feed.bedford_end_of_year_transitions || []).map(importedForm => {
    return {
      ...importedForm,
      type: 'bedford_end_of_year_transitions',
      sort_timestamp: importedForm.form_timestamp
    };
  });

  const mergedNotes = [
    ...eventNotes,
    ...deprecatedInterventions,
    ...transitionNotes,
    ...secondTransitionNotes,
    ...homeworkHelpSessions,
    ...remoteLearningInsights,
    ...fallStudentVoiceInsights,
    ...flattenedForms,
    ...bedfordEndOfYearTransitions
  ];
  return _.sortBy(mergedNotes, 'sort_timestamp').reverse();
}
