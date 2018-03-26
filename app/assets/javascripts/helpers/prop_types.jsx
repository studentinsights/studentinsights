import React from 'react';

const PropTypes = {
  // UI actions, stepping stone to Flux
  actions: React.PropTypes.shape({
    onColumnClicked: React.PropTypes.func.isRequired,
    onClickSaveNotes: React.PropTypes.func.isRequired,
    onClickSaveService: React.PropTypes.func.isRequired,
    onClickDiscontinueService: React.PropTypes.func.isRequired,
    onChangeNoteInProgressText: React.PropTypes.func.isRequired,
    onClickNoteType: React.PropTypes.func.isRequired
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
  }),

  // Return a propType for us in `PropTypes.shape`
  // that requires a key to be passed, but allows
  // null values (which `.isRequired` doesn't allow).
  nullableWithKey(propType) {
    return (props, propName, componentName) => {
      if (!props.hasOwnProperty(propName)) {
        return new Error(
          'Missing prop `' + propName + '` in ' +
          ' `' + componentName + '`. Nulls are allowed, but must be passed explicitly.'
        );
      }
    };
  }
};

export default PropTypes;
