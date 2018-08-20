import PropTypes from 'prop-types';


// UI actions, stepping stone to Flux
export const actions = PropTypes.shape({
  onColumnClicked: PropTypes.func,
  onClickSaveNotes: PropTypes.func,
  onClickSaveService: PropTypes.func,
  onClickDiscontinueService: PropTypes.func,
  onChangeNoteInProgressText: PropTypes.func,
  onClickNoteType: PropTypes.func,
  onChangeAttachmentUrl: PropTypes.func,
});

export const requests = PropTypes.shape({
  saveNote: PropTypes.string,
  discontinueService: PropTypes.object
});

export const api = PropTypes.shape({
  saveNotes: PropTypes.func.isRequired
});


// The feed of all notes and data entered in Student Insights for
// a student.
export const feed = PropTypes.shape({
  transition_notes: PropTypes.array,
  event_notes: PropTypes.array.isRequired,
  services: PropTypes.shape({
    active: PropTypes.array.isRequired,
    discontinued: PropTypes.array.isRequired
  }),
  deprecated: PropTypes.shape({
    interventions: PropTypes.array.isRequired
  })
});

export const history = PropTypes.shape({
  pushState: PropTypes.func.isRequired,
  replaceState: PropTypes.func.isRequired
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