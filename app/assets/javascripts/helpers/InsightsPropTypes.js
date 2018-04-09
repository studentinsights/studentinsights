import React from 'react';


  // UI actions, stepping stone to Flux
export const actions = React.PropTypes.shape({
  onColumnClicked: React.PropTypes.func,
  onClickSaveNotes: React.PropTypes.func,
  onClickSaveService: React.PropTypes.func,
  onClickDiscontinueService: React.PropTypes.func,
  onChangeNoteInProgressText: React.PropTypes.func,
  onClickNoteType: React.PropTypes.func,
  onChangeAttachmentUrl: React.PropTypes.func,
});

export const requests = React.PropTypes.shape({
  saveNote: React.PropTypes.string,
  discontinueService: React.PropTypes.object
});

export const api = React.PropTypes.shape({
  saveNotes: React.PropTypes.func.isRequired
});


// The feed of all notes and data entered in Student Insights for
// a student.
export const feed = React.PropTypes.shape({
  event_notes: React.PropTypes.array.isRequired,
  services: React.PropTypes.shape({
    active: React.PropTypes.array.isRequired,
    discontinued: React.PropTypes.array.isRequired
  }),
  deprecated: React.PropTypes.shape({
    interventions: React.PropTypes.array.isRequired
  })
});

export const history = React.PropTypes.shape({
  pushState: React.PropTypes.func.isRequired,
  replaceState: React.PropTypes.func.isRequired
});


// Return a propType for us in `PropTypes.shape`
// that requires a key to be passed, but allows
// null values (which `.isRequired` doesn't allow).
export function nullableWithKey(propType) {
  return (props, propName, componentName) => {
    if (!props.hasOwnProperty(propName)) {
      return new Error(
        'Missing prop `' + propName + '` in ' +
        ' `' + componentName + '`. Nulls are allowed, but must be passed explicitly.'
      );
    }
  };
}