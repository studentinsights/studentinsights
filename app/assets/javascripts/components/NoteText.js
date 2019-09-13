import PropTypes from 'prop-types';
import React from 'react';
import LinkifyNoteText from './LinkifyNoteText';


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
  border: 0,
  outline: '1px solid transparent' // for sizing when we add a outline on hover when editable
};


// A visual component for rendering just the text content of an EventNote.
function NoteText(props) {
  const {text, disableLinks, style} = props;
  
  if (disableLinks) {
    return (
      <div className="NoteText" style={{...exportedNoteText, ...style}}>
        {text}
      </div>
    );
  }

  return <LinkifyNoteText style={{...exportedNoteText, ...style}} text={text} />;
}

NoteText.propTypes = {
  text: PropTypes.string.isRequired,
  style: PropTypes.object,
  disableLinks: PropTypes.bool
};

export default NoteText;