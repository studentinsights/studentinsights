import React from 'react';
import qs from 'query-string';
import _ from 'lodash';
import FeedView from '../feed/FeedView';
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
        <FeedView feedCards={feedCards} />
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


const styles = {
  root: {
    fontSize: 14,
    padding: 10,
    paddingTop: 0
  },
  person: {
    fontWeight: 'bold'
  }
};

export default HomeFeed;