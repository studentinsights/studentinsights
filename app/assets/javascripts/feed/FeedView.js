import PropTypes from 'prop-types';
import React from 'react';
import EventNoteCard from './EventNoteCard';
import BirthdayCard from './BirthdayCard';
import IncidentCard from './IncidentCard';


// Pure UI component for rendering feed cards (eg, on the home page)
export class FeedView extends React.Component {
  render() {
    const {feedCards} = this.props;
    return (
      <div className="FeedView">
        {feedCards.map(feedCard => {
          const {type, json} = feedCard;
          if (type === 'event_note_card') return this.renderEventNoteCard(json);
          if (type === 'birthday_card') return this.renderBirthdayCard(json);
          if (type === 'incident_card') return this.renderIncidenCard(json);
          console.warn('Unexpected card type: ', type); // eslint-disable-line no-console
        })}
      </div>
    );
  }

  renderEventNoteCard(json) {
    return <EventNoteCard
      key={json.id}
      style={styles.card}
      eventNoteCardJson={json} />;
  }

  renderBirthdayCard(json) {
    return <BirthdayCard
      key={`birthday:${json.id}`}
      style={styles.card}
      studentBirthdayCard={json} />;
  }

  renderIncidenCard(json) {
    return <IncidentCard
      key={json.id}
      style={styles.card}
      incidentCard={json} />;
  }    
}
FeedView.propTypes = {
  feedCards: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    json: PropTypes.object.isRequired
  })).isRequired
};


const styles = {
  card: {
    marginTop: 20
  }
};

export default FeedView;
