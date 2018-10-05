import PropTypes from 'prop-types';
import React from 'react';
import EditableTextComponent from './EditableTextComponent';
import {exportedNoteText} from './NoteText';
import NoteRevisionMessage from './NoteRevisionMessage';


// A visual component for rendering note text that also handles UX and styling
// for editing the text in-place.  The `onBlurText` callback is called
// when focus is blurred (regardless of whether text has been changed).
//
// Relies on CSS class for hover styling when editable.
function EditableNoteText(props) {
  const {text, style, numberOfRevisions, onBlurText} = props;

  return (
    <div className="EditableNoteText">
      <EditableTextComponent
        style={{...exportedNoteText, style}}
        className="EditableTextComponent EditableNoteText-with-hover"
        text={text}
        onBlurText={onBlurText} />
      <NoteRevisionMessage numberOfRevisions={numberOfRevisions} />
    </div>
  );
}

EditableNoteText.propTypes = {
  text: PropTypes.string.isRequired,
  numberOfRevisions: PropTypes.number.isRequired,
  onBlurText: PropTypes.func.isRequired,
  style: PropTypes.object
};
EditableNoteText.defaultProps = {
  style: {}
};

export default EditableNoteText;