(function() {
  window.shared || (window.shared = {});

  // Allow a prop to be null, if the prop type explicitly allows this.
  // Then fall back to another validator if a value is passed.
  var nullable = function(validator) {
    return function(props, propName, componentName) {
      if (props[propName] === null) return null;
      return validator(props, propName, componentName);
    };
  };

  var PropTypes = window.shared.PropTypes = {
    nullable: nullable,

    // UI actions, stepping stone to Flux
    actions: React.PropTypes.shape({
      onColumnClicked: React.PropTypes.func.isRequired,
      onClickSaveNotes: React.PropTypes.func.isRequired,
      onClickSaveService: React.PropTypes.func.isRequired,
      onClickDiscontinueService: React.PropTypes.func.isRequired
    }),
    requests: React.PropTypes.shape({
      saveNotes: nullable(React.PropTypes.object).isRequired
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
