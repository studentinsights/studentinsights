import React from 'react';
import Badge from './Badge';
import {
  eventNoteTypeText,
  eventNoteTypeColor
} from './eventNoteType';


// A visual UI element for a badge indicating a particular 
// event note type.
function NoteBadge({eventNoteTypeId, style}) {
  const text = eventNoteTypeText(eventNoteTypeId);
  const backgroundColor = eventNoteTypeColor(eventNoteTypeId);
  return Badge({text, backgroundColor, style});
}
NoteBadge.propTypes = {
  eventNoteTypeId: React.PropTypes.number.isRequired,
  style: React.PropTypes.object
};

export default NoteBadge;