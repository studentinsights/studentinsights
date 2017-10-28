import React from 'react';

(function() {
  window.shared || (window.shared = {});

  window.shared.PropTypes = {
    // UI actions, stepping stone to Flux
    actions: React.PropTypes.shape({
      onColumnClicked: React.PropTypes.func.isRequired,
      onClickSaveNotes: React.PropTypes.func.isRequired,
      onClickSaveService: React.PropTypes.func.isRequired,
      onClickDiscontinueService: React.PropTypes.func.isRequired
    }),
    requests: React.PropTypes.shape({
      saveNote: React.PropTypes.string,
      discontinueService: React.PropTypes.object
    }),
    api: React.PropTypes.shape({
      saveNotes: React.PropTypes.func.isRequired
    }),

    // The feed of all notes and data entered in Student Insights for
    // a student.
    feed: React.PropTypes.shape({
      event_notes: React.PropTypes.array.isRequired,
      services: React.PropTypes.shape({
        active: React.PropTypes.array.isRequired,
        discontinued: React.PropTypes.array.isRequired
      }),
      deprecated: React.PropTypes.shape({
        interventions: React.PropTypes.array.isRequired
      })
    }),

    history: React.PropTypes.shape({
      pushState: React.PropTypes.func.isRequired,
      replaceState: React.PropTypes.func.isRequired
    })
  };
})();
