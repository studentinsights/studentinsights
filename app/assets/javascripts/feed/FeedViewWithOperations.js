import PropTypes from 'prop-types';
import React from 'react';
import apiPutJson from '../helpers/apiFetchJson';
import FeedView from './FeedView';



export default class FeedViewWithOperations extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      feedCards: props.defaultFeedCards
    };
  }

  cardPropsFn(type, json) {
    if (type !== 'event_note_card') return {};

    return (
      <div className="RestrictedBits">
        <a href="#" style={styles.link} onClick={this.onClickMarkRestricted.bind(this, json.id)}>Mark restricted</a>
      </div>
    );
  }

  onClickMarkRestricted(eventNoteId, e) {
    e.preventDefault();
    if (!confirm("Are you sure?")) return;

    // Make server request optimistically
    apiPutJson(`/api/event_notes/${eventNoteId}/mark_as_restricted`)
      .catch(err => alert('There was an error trying to update the note.  help@studentinsights.org has been sent a notification.'));

    // Remove from UI now
    const {feedCards} = this.state;
    const feedCardsWithout = feedCards.filter(feedCard => {
      if ((feedCard.type === 'event_note_card') && (feedCard.json.id === eventNoteId)) return false;
      return true;
    });
    this.setState({feedCards: feedCardsWithout});
  }

  render() {
    const {feedCards} = this.state;
    return (
      <FeedView
        feedCards={feedCards}
        cardPropsFn={this.cardPropsFn}
      />
    );
  }
}
FeedViewWithOperations.propTypes = {
  defaultFeedCards: PropTypes.arrayOf.isRequired
};

const styles = {
  link: {
    color: '#ccc'
  }
};
