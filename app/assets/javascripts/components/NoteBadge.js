import PropTypes from 'prop-types';
import Badge from './Badge';
import {
  eventNoteTypeText,
  eventNoteTypeColor
} from '../helpers/eventNoteType';


// A visual UI element for a badge indicating a particular 
// event note type.
function NoteBadge({eventNoteTypeId, style}) {
  const text = eventNoteTypeText(eventNoteTypeId);
  const backgroundColor = eventNoteTypeColor(eventNoteTypeId);
  return Badge({text, backgroundColor, style});
}
NoteBadge.propTypes = {
  eventNoteTypeId: PropTypes.number.isRequired,
  style: PropTypes.object
};

export default NoteBadge;