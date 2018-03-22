import React from 'react';
import EditableTextComponent from './EditableTextComponent';
import {exportedNoteText} from './NoteText';

const styles = {
  revisionsText: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 13
  }
};

// Render 
function renderNumberOfRevisions(numberOfRevisions) {
  if (numberOfRevisions === undefined) return null;
  return (
    <div style={styles.revisionsText}>
      {(numberOfRevisions === 1)
          ? 'Revised 1 time'
          : 'Revised ' + numberOfRevisions + ' times'}
    </div>
  );
}


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
        className="EditableNoteText-with-hover"
        text={text}
        onBlurText={onBlurText} />
      {renderNumberOfRevisions(numberOfRevisions)}
    </div>
  );
}

EditableNoteText.propTypes = {
  text: React.PropTypes.string.isRequired,
  numberOfRevisions: React.PropTypes.num.isRequired,
  onBlurText: React.PropTypes.func.isRequired,
  style: React.PropTypes.object
};
EditableNoteText.defaultProps = {
  style: {}
};

export default EditableNoteText;