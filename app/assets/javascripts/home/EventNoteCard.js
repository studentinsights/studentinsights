import React from 'react';
import FeedCardFrame from './FeedCardFrame';
import Educator from '../components/Educator';
import NoteText from '../components/NoteText';
import HouseBadge from '../components/HouseBadge';
import NoteBadge from '../components/NoteBadge';
import {toMomentFromTime} from '../helpers/toMoment';
import {eventNoteTypeText} from '../components/eventNoteType';


// Render a card in the feed for an EventNote
class EventNoteCard extends React.Component {
  render() {
    const {nowFn} = this.context;
    const now = nowFn();
    const {eventNoteCardJson, style} = this.props;
    const {student, educator} = eventNoteCardJson;

    return (
      <div className="EventNoteCard">
        <FeedCardFrame
          style={style}
          student={student}
          byEl={
            <div>
              <span>by </span>
              <Educator
                style={styles.person}
                educator={educator} />
            </div>
          }
          whereEl={<div>in {eventNoteTypeText(eventNoteCardJson.event_note_type_id)}</div>}
          whenEl={<div>{toMomentFromTime(eventNoteCardJson.recorded_at).from(now)} on {toMomentFromTime(eventNoteCardJson.recorded_at).format('M/D')}</div>}
          badgesEl={<div>
            {student.house && <HouseBadge style={styles.footerBadge} house={student.house} />}
            <NoteBadge style={styles.footerBadge} eventNoteTypeId={eventNoteCardJson.event_note_type_id} />
          </div>}
        >
          <NoteText text={eventNoteCardJson.text} />
        </FeedCardFrame>
      </div>
    );
  }
}
EventNoteCard.contextTypes = {
  nowFn: React.PropTypes.func.isRequired
};
EventNoteCard.propTypes = {
  eventNoteCardJson: React.PropTypes.shape({
    recorded_at: React.PropTypes.string.isRequired,
    event_note_type_id: React.PropTypes.number.isRequired,
    text: React.PropTypes.string.isRequired,
    educator: React.PropTypes.object.isRequired,
    student: React.PropTypes.shape({
      id: React.PropTypes.number.isRequired,
      first_name: React.PropTypes.string.isRequired,
      last_name: React.PropTypes.string.isRequired,
      grade: React.PropTypes.string.isRequired,
      house: React.PropTypes.string,
      homeroom: React.PropTypes.shape({
        id: React.PropTypes.number.isRequired,
        name: React.PropTypes.string.isRequired,
        educator: React.PropTypes.object
      })
    })
  }).isRequired,
  style: React.PropTypes.object
};


const styles = {
  footerBadge: {
    marginLeft: 5
  },
  person: {
    fontWeight: 'bold'
  }
};

export default EventNoteCard;