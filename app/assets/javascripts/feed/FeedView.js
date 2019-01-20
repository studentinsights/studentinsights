import PropTypes from 'prop-types';
import React from 'react';
import EventNoteCard from './EventNoteCard';
import BirthdayCard from './BirthdayCard';
import IncidentCard from './IncidentCard';
import ModelLoader from '../components/ModelLoader';


// Pure UI component for rendering feed cards (eg, on the home page)
export default class FeedView extends React.Component {
  render() {
    const {feedCards, cardPropsFn, style} = this.props;
    return (
      <ModelLoader>{predict => (
        <div className="FeedView" style={style}>
          {feedCards.map(feedCard => {
            const {type, json} = feedCard;
            const cardProps = cardPropsFn ? cardPropsFn(type, json) : {};
            if (type === 'event_note_card') return this.renderEventNoteCard(json, cardProps, predict);
            if (type === 'birthday_card') return this.renderBirthdayCard(json, cardProps);
            if (type === 'incident_card') return this.renderIncidenCard(json, cardProps);
            console.warn('Unexpected card type: ', type); // eslint-disable-line no-console
          })}
        </div>
      )}</ModelLoader>
    );
  }

  renderEventNoteCard(json, cardProps, predict) {
    return <EventNoteCard
      key={json.id}
      style={styles.card}
      eventNoteCardJson={json}
      predict={predict}
      {...cardProps}
    />;
  }

  renderBirthdayCard(json, cardProps = {}) {
    return <BirthdayCard
      key={`birthday:${json.id}`}
      style={styles.card}
      studentBirthdayCard={json}
      {...cardProps}
    />;
  }

  renderIncidenCard(json, cardProps = {}) {
    return <IncidentCard
      key={json.id}
      style={styles.card}
      incidentCard={json}
      {...cardProps}
    />;
  }    
}
FeedView.propTypes = {
  feedCards: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    json: PropTypes.object.isRequired
  })).isRequired,
  cardPropsFn: PropTypes.func,
  style: PropTypes.object
};


const styles = {
  card: {
    marginTop: 20
  }
};
