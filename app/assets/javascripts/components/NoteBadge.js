import React from 'react';
import {
  eventNoteTypeText,
  eventNoteTypeColor
} from './eventNoteType';


// A visual UI element for a badge indicating a particular 
// event note type.
function NoteBadge({eventNoteTypeId, style}) {
  const text = eventNoteTypeText(eventNoteTypeId);
  const color = eventNoteTypeColor(eventNoteTypeId);
  const mergedStyle = {
    ...styles.noteBadge,
    backgroundColor: color,
    color: 'white',
    opacity: 0.5,
    ...style
  };
  return <span className="NoteBadge" style={mergedStyle}>{text}</span>;
}
NoteBadge.propTypes = {
  eventNoteTypeId: React.PropTypes.number.isRequired,
  style: React.PropTypes.object
};

const styles = {
  noteBadge: {
    padding: 5
  }
};

export default NoteBadge;