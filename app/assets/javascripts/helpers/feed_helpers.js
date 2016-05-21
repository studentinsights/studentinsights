(function() {
  window.shared || (window.shared = {});
  var merge = window.shared.ReactHelpers.merge;

  /*
  Functions for transforming the feed data structure that holds
  all notes and services for a student.
  */
  var FeedHelpers = window.shared.FeedHelpers = {
    // Merges data from event_notes and deprecated tables (notes, interventions).
    mergedNotes: function(feed) {
      var deprecatedInterventions = feed.deprecated.interventions.map(function(intervention) {
        return merge(intervention, {
          type: 'deprecated_interventions',
          sort_timestamp: intervention.start_date_timestamp
        });
      });
      var eventNotes = feed.event_notes.map(function(eventNote) {
        return merge(eventNote, {
          type: 'event_notes',
          sort_timestamp: eventNote.recorded_at
        });
      });

      var mergedNotes = eventNotes.concat.apply(eventNotes, [deprecatedInterventions]);
      return _.sortBy(mergedNotes, 'sort_timestamp').reverse();
    },

    matchesMergedNoteType: function(mergedNote, mergedNoteType, mergedNoteTypeId) {
      if (mergedNote.type !== mergedNoteType) return false;
      switch (mergedNote.type) {
        case 'event_notes': return (mergedNote.event_note_type_id === mergedNoteTypeId);
        case 'deprecated_interventions': return (mergedNote.intervention_type_id === mergedNoteTypeId);
      }

      return false;
    },
  };

})();
