import React from 'react';
import qs from 'query-string';
import _ from 'lodash';
import GenericLoader from '../components/GenericLoader';
import EventNoteCard from './EventNoteCard';
import BirthdayCard from './BirthdayCard';
import {toMomentFromTime} from '../helpers/toMoment';

/*
This component fetches data and renders it, showing the user
the feed of what's happening with their students.
*/
class HomeFeed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasLoaded: false,
      error: null,
      cards: []
    };
    this.fetchFeed = this.fetchFeed.bind(this);
    this.onResolved = this.onResolved.bind(this);
    this.onRejected = this.onRejected.bind(this);
    this.onMore = this.onMore.bind(this);
    this.renderFeed = this.renderFeed.bind(this);
  }

  componentDidMount() {
    const {nowFn} = this.context;
    this.fetchFeed(nowFn().unix());
  }

  fetchFeed(nowTimestamp) {
    console.log(nowTimestamp);
    const limit = 20;
    const url = '/home/feed_json?' + qs.stringify({
      limit,
      time_now: nowTimestamp
    });
    return fetch(url, { credentials: 'include' })
      .then(response => response.json())
      .then(json => json.feed_cards)
      .then(this.onResolved)
      .catch(this.onRejected);
  }

  onResolved(newCards) {
    const previousCards = (this.state.cards || []);
    debugger
    const cards = _.sortBy(previousCards.concat(newCards), card => toMomentFromTime(card.timestamp).unix()).reverse();
    this.setState({
      cards,
      hasLoaded: true, 
      error: null
    });
  }

  onRejected(error) {
    this.setState({error});
  }

  onMore(event) {
    const {cards} = this.state;
    event.preventDefault();
    const timestamp = toMomentFromTime(_.last(cards).timestamp).unix();
    this.fetchFeed(timestamp);
  }

  render() {
    const {hasLoaded, cards, error} = this.state;

    return (
      <div className="HomeFeed" style={styles.root}>
        {!hasLoaded && <div style={{padding: 10, ...styles.card}}>Loading...</div>}
        {cards && cards.length > 0 && <div style={styles.card}>{this.renderFeed(cards)}</div>}
        {error !== null && <div style={{padding: 10, ...styles.card}}>There was an error loading this data.</div>}
      </div>
    );
  }

  renderFeed(feedCards) {
    return (
      <div>
        <HomeFeedPure feedCards={feedCards} />
        <a
          style={{display: 'block', ...styles.card}}
          href="#more"
          onClick={this.onMore}>See more</a>
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