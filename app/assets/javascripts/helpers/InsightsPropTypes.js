import PropTypes from 'prop-types';
import _ from 'lodash';


// UI actions, stepping stone to Flux
export const actions = PropTypes.shape({
  onColumnClicked: PropTypes.func.isRequired,
  onUpdateExistingNote: PropTypes.func.isRequired,
  onCreateNewNote: PropTypes.func.isRequired,
  onDeleteEventNoteAttachment: PropTypes.func.isRequired,
  onSaveService: PropTypes.func.isRequired,
  onDiscontinueService: PropTypes.func.isRequired,
  onSecondTransitionNoteAdded: PropTypes.func.isRequired
});

export const requests = PropTypes.shape({
  createNote: PropTypes.string,
  updateNote: PropTypes.object,
  saveService: PropTypes.string,
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
  homework_help_sessions: PropTypes.array,
  fall_student_voice_surveys: PropTypes.array,
  flattened_forms: PropTypes.array,
  bedford_end_of_year_transitions: PropTypes.array,
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
    if (!_.has(props, propName)) {
      return new Error(
        'Missing prop `' + propName + '` in ' +
        ' `' + componentName + '`. Nulls are allowed, but must be passed explicitly.'
      );
    }
  };
}