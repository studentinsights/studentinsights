import React from 'react';
import qs from 'query-string';
import _ from 'lodash';
import EventNoteCard from './EventNoteCard';
import BirthdayCard from './BirthdayCard';
import IncidentCard from './IncidentCard';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {toMomentFromTime} from '../helpers/toMoment';


export function mergeCards(previousCards, newCards) {
  return _.sortBy(previousCards.concat(newCards), card => -1 * toMomentFromTime(card.timestamp).unix());
}

/*
This component fetches data and renders it, showing the user
the feed of what's happening with their students.
*/
class HomeFeed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasLoadedAnyData: false,
      isFetching: false,
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
    this.setState({isFetching: true});

    const {limit, educatorId} = this.props;
    const params = {
      limit,
      time_now: nowTimestamp,
      educator_id: educatorId
    };
    const url = '/api/home/feed_json?' + qs.stringify(params);
    return apiFetchJson(url)
      .then(json => json.feed_cards)
      .then(this.onResolved)
      .catch(this.onRejected);
  }

  onResolved(newCards) {
    const previousCards = (this.state.cards || []);
    const cards = mergeCards(previousCards, newCards);
    this.setState({
      cards,
      isFetching: false,
      hasLoadedAnyData: true, 
      error: null
    });
  }

  onRejected(error) {
    this.setState({
      isFetching: false,
      error
    });
  }

  onMore(event) {
    const {cards} = this.state;
    event.preventDefault();
    const timestamp = toMomentFromTime(_.last(cards).timestamp).unix();
    this.fetchFeed(timestamp);
  }

  render() {
    const {hasLoadedAnyData, cards, error} = this.state;

    return (
      <div className="HomeFeed" style={styles.root}>
        {!hasLoadedAnyData && <div style={{padding: 10, ...styles.card}}>Loading...</div>}
        {cards && cards.length > 0 && <div style={styles.card}>{this.renderFeed(cards)}</div>}
        {error !== null && <div style={{padding: 10, ...styles.card}}>There was an error loading this data.</div>}
      </div>
    );
  }

  renderFeed(feedCards) {
    return (
      <div>
        <HomeFeedPure feedCards={feedCards} />
        {this.renderSeeMore(feedCards)}
      </div>
    );
  }

  renderSeeMore(feedCards) {
    const {limit} = this.props;
    const {isFetching} = this.state;

    if (feedCards.length < limit) return null;
    if (isFetching) return <span style={{display: 'block', ...styles.card}}>Loading more...</span>;
    return <a
      className="HomeFeed-load-more"
      style={{display: 'block', ...styles.card}}
      href="#more"
      onClick={this.onMore}>See more</a>;
  }
}
HomeFeed.contextTypes = {
  nowFn: React.PropTypes.func.isRequired
};
HomeFeed.propTypes = {
  educatorId: React.PropTypes.number.isRequired,
  limit: React.PropTypes.number
};
HomeFeed.defaultProps = {
  limit: 10
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