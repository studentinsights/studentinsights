import React from 'react';
import qs from 'query-string';
import GenericLoader from '../components/GenericLoader';
import EventNoteCard from './EventNoteCard';
import BirthdayCard from './BirthdayCard';


/*
This component fetches data and renders it, showing the user
the feed of what's happening with their students.
*/
class HomeFeed extends React.Component {
  constructor(props) {
    super(props);
    this.fetchFeed = this.fetchFeed.bind(this);
    this.onMore = this.onMore.bind(this);
    this.renderFeed = this.renderFeed.bind(this);
  }

  fetchFeed(now) {
    const limit = 20;
    const url = '/home/feed_json?' + qs.stringify({
      limit,
      time_now: now
    });
    return fetch(url, { credentials: 'include' })
      .then(response => response.json())
      .then(json => json.feed_cards);
  }

  onMore() {
  }

  render() {
    const {nowFn} = this.context;
    const now = nowFn();

    return (
      <div className="HomeFeed" style={styles.root}>
        <GenericLoader
          style={styles.card}
          promiseFn={this.fetchFeed.bind(this, now)}
          render={this.renderFeed} />
      </div>
    );
  }

  renderFeed(feedCards) {
    return (
      <div>
        <HomeFeedPure feedCards={feedCards} />
        <a style={styles.card} href="#more" onClick={this.onMore}>See more</a>
      </div>
    );
  }
}
HomeFeed.contextTypes = {
  nowFn: React.PropTypes.func.isRequired
};

// Pure UI component for rendering home feed
export class HomeFeedPure extends React.Component {
  render() {
    const {feedCards} = this.props;
    return (
      <div className="HomeFeedPure">
        {feedCards.map(feedCard => {
          const {type, json} = feedCard;
          if (type === 'event_note_card') return this.renderEventNoteCard(json);
          if (type === 'birthday_card') return this.renderBirthdayCard(json);
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
}
HomeFeedPure.propTypes = {
  feedCards: React.PropTypes.arrayOf(React.PropTypes.shape({
    type: React.PropTypes.string.isRequired,
    timestamp: React.PropTypes.string.isRequired,
    json: React.PropTypes.object.isRequired
  })).isRequired
};


const styles = {
  root: {
    fontSize: 14,
    padding: 10,
    paddingTop: 0
  },
  person: {
    fontWeight: 'bold'
  },
  card: {
    marginTop: 20
  }
};

export default HomeFeed;