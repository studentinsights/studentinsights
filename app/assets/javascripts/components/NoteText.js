import PropTypes from 'prop-types';
import React from 'react';


export const exportedNoteText = {
  marginTop: 5,
  padding: 0,
  fontFamily: "'Open Sans', sans-serif",
  fontSize: 14,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  border: '1px solid transparent' // for sizing when we add a border on hover when editable
};


// A visual component for rendering just the text content of an EventNote.
function NoteText(props) {
  const {text, style} = props;
  return (
    <div style={{...exportedNoteText, style}}>
      {text}
    </div>
  );
}

NoteText.propTypes = {
  text: PropTypes.string.isRequired,
  style: PropTypes.object
};

export default NoteText;