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

    service_types_index: React.PropTypes.shape({
      502: React.PropTypes.shape({
        id: React.PropTypes.number,
        name:React.PropTypes.string.isRequired
      }),
      503: React.PropTypes.shape({
        id: React.PropTypes.number,
        name:React.PropTypes.string.isRequired
      }),
      504: React.PropTypes.shape({
        id: React.PropTypes.number,
        name:React.PropTypes.string.isRequired
      }),
      505: React.PropTypes.shape({
        id: React.PropTypes.number,
        name:React.PropTypes.string.isRequired
      }),
      506: React.PropTypes.shape({
        id: React.PropTypes.number,
        name:React.PropTypes.string.isRequired
      }),
      507: React.PropTypes.shape({
        id: React.PropTypes.number,
        name:React.PropTypes.string.isRequired
      }),
      508: React.PropTypes.shape({
        id: React.PropTypes.number,
        name:React.PropTypes.string.isRequired
      }),
      511: React.PropTypes.shape({
        id: React.PropTypes.number,
        name:React.PropTypes.string.isRequired
      }),
      513: React.PropTypes.shape({
        id: React.PropTypes.number,
        name:React.PropTypes.string.isRequired
      }),
      514: React.PropTypes.shape({
        id: React.PropTypes.number,
        name:React.PropTypes.string.isRequired
      }),
      509: React.PropTypes.shape({
        id: React.PropTypes.number,
        name:React.PropTypes.string.isRequired
      }),
      510: React.PropTypes.shape({
        id: React.PropTypes.number,
        name:React.PropTypes.string.isRequired
      }),
      512: React.PropTypes.shape({
        id: React.PropTypes.number,
        name:React.PropTypes.string.isRequired
      })
    }),

    event_note_types_index: React.PropTypes.shape({
      300: React.PropTypes.shape({
        id: React.PropTypes.number,
        name:React.PropTypes.string.isRequired
      }),
      301: React.PropTypes.shape({
        id: React.PropTypes.number,
        name:React.PropTypes.string.isRequired
      }),
      302: React.PropTypes.shape({
        id: React.PropTypes.number,
        name:React.PropTypes.string.isRequired
      }),
      304: React.PropTypes.shape({
        id: React.PropTypes.number,
        name:React.PropTypes.string.isRequired
      }),
      305: React.PropTypes.shape({
        id: React.PropTypes.number,
        name:React.PropTypes.string.isRequired
      }),
      306: React.PropTypes.shape({
        id: React.PropTypes.number,
        name:React.PropTypes.string.isRequired
      })
    }),

    history: React.PropTypes.shape({
      pushState: React.PropTypes.func.isRequired,
      replaceState: React.PropTypes.func.isRequired
    })
  };
})();
