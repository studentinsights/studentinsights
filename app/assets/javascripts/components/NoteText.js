import PropTypes from 'prop-types';
import React from 'react';


// The sizing for long text with no space (eg, URLs) is different
// in IE11 vs. Chrome.  Chrome forces `break-all` essentially when the
// CSS is `break-word` and IE doesn't.  So the `overflow` is for IE so that
// that text doesn't spill over or influence layout.  It's not ideal
// but it's okay if the end of long URLs are hidden, this is an uncommon
// case.
export const exportedNoteText = {
  marginTop: 5,
  padding: 0,
  fontFamily: "'Open Sans', sans-serif",
  fontSize: 14,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  overflowX: 'hidden',
  border: '1px solid transparent' // for sizing when we add a border on hover when editable
};


// A visual component for rendering just the text content of an EventNote.
function NoteText(props) {
  const {text, style} = props;
  return (
    <div style={{...exportedNoteText, ...style}}>
      {text}
    </div>
  );
}

NoteText.propTypes = {
  text: PropTypes.string.isRequired,
  style: PropTypes.object
};

export default NoteText;