import React from 'react';
import EditableTextComponent from './EditableTextComponent';

const styles = {
  noteText: {
    marginTop: 5,
    padding: 0,
    fontFamily: "'Open Sans', sans-serif",
    fontSize: 14,
    whiteSpace: 'pre-wrap'
  }
};

// A component for rendering just the text content of an EventNote.
//
// This include visual styling, but also supports `isEditable`, which
// then provides an `onBlurText` callback for when focus is blurred
// (regardless of whether text has been changed).
//
// Relies on CSS class for hover styling when editable.
function NoteText(props) {
  const {isEditable, text, onBlurText, style} = props;

  if (isEditable) {
    return <EditableTextComponent
      style={{...styles.noteText, style}}
      className="NoteText NoteText-with-hover"
      text={text}
      onBlurText={onBlurText} />;
  }

  return (
    <div style={{...styles.noteText, style}}>
      {text}
    </div>
  );
}

NoteText.propTypes = {
  text: React.PropTypes.string.isRequired,
  isEditable: React.PropTypes.bool,
  onBlurText: React.PropTypes.func,
  style: React.PropTypes.object
};
NoteText.defaultProps = {
  isEditable: false
};

export default NoteText;