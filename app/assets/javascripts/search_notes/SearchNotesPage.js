import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {updateGlobalStylesToTakeFullHeight} from '../helpers/globalStylingWorkarounds';
import {supportsHouse} from '../helpers/PerDistrict';
import {ALL} from '../components/SimpleFilterSelect';
import {TIME_RANGE_SCHOOL_YEAR} from '../components/SelectTimeRange';
import SectionHeading from '../components/SectionHeading';
import Card from '../components/Card';
import MutableFeedView from '../feed/MutableFeedView';
import SearchNotesBar from './SearchNotesBar';
import SearchQueryFetcher from './SearchQueryFetcher';
import WordCloud from './WordCloud';


// Page for searching notes
export default class SearchNotesPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: initialQuery()
    };

    this.onQueryChanged = this.onQueryChanged.bind(this);
    this.renderResultsSection = this.renderResultsSection.bind(this);
    this.renderQueryResults = this.renderQueryResults.bind(this);
  }

  componentDidMount() {
    updateGlobalStylesToTakeFullHeight();
  }

  onQueryChanged(queryDiff) {
    const {query} = this.state;
    this.setState({
      query: {
        ...query,
        ...queryDiff
      }
    });
  }

  render() {
    const {districtKey} = this.context;
    const {query} = this.state;

    return (
      <div style={{...styles.flexVertical, margin: 10}}>
        <SectionHeading>Search notes</SectionHeading>
        <SearchNotesBar
          style={styles.searchBar}
          query={query}
          debounceInputMs={300}
          onQueryChanged={this.onQueryChanged}
          includeHouse={supportsHouse(districtKey)} />
        {this.renderResultsSection()}
      </div>
    );
  }

  renderResultsSection() {
    const {query} = this.state;
    if (_.isEqual(query, initialQuery())) return this.renderPrompt();

    return (
      <SearchQueryFetcher
        key={JSON.stringify(query)}
        query={query}
        renderFn={this.renderQueryResults}
      />
    );
  }

  renderQueryResults(json) {
    if (!json) return this.renderPrompt();
    
    const {educatorLabels} = this.props;
    const feedCards = json.event_note_cards;
    const allResultsSize = json.meta.all_results_size;
    return (
      <div style={styles.queryResults}>
        {this.renderMeta(allResultsSize, feedCards)}
        <div style={{display: 'flex'}}>
          <MutableFeedView
            style={{flex: 1}}
            defaultFeedCards={feedCards}
            educatorLabels={educatorLabels}
          />
          <div style={{flex: 1}}>
            {this.renderSidebar(feedCards)}
          </div>
        </div>
      </div>
    );
  }

  renderPrompt() {
    return <div style={styles.searchAway}>What do you want to know about?</div>;
  }

  renderMeta(allResultsSize, feedCards) {
    if (allResultsSize === 0) {
      return <div style={styles.meta}>No results.</div>;
    }

    if (allResultsSize === 1) {
      return <div style={styles.meta}>Showing the only result.</div>;
    }

    if (allResultsSize === feedCards.length) {
      return <div style={styles.meta}>Showing all {oneOrMoreResult(feedCards.length)}.</div>;
    }

    return <div style={styles.meta}>Showing the first {oneOrMoreResult(feedCards.length)} of {oneOrMoreResult(allResultsSize)} total.</div>;
  }

  renderSidebar(feedCards) {
    const {showWordCloud} = this.props;
    if (!showWordCloud && window.location.search.indexOf('wordcloud') === -1) return null;
    
    const words = wordsFromEventNoteCards(feedCards);
    return (
      <div style={styles.flexVertical}>
        <Card style={styles.card}>
          <div style={styles.cardTitle}>Themes within these notes</div>
          <WordCloud
            width={400}
            height={400}
            words={words}
          />
        </Card>
      </div>
    );
  }
}
SearchNotesPage.propTypes = {
  educatorId: PropTypes.number.isRequired,
  educatorLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
  showWordCloud: PropTypes.bool
};

const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  searchBar: {
    padding: 10
  },
  queryResults: {
    fontSize: 14,
    paddingLeft: 10
  },
  sidebar: {
    flex: 1,
  },
  meta: {
    paddingTop: 5,
    color: '#aaa'
  },
  searchAway: {
    paddingLeft: 10,
    paddingTop: 20,
    color: '#aaa'
  },
  card: {
    margin: 20,
    padding: 0,
    flexDirection: 'column',
    display: 'flex'
  },
  cardTitle: {
    backgroundColor: '#eee',
    padding: 10,
    color: 'black',
    borderBottom: '1px solid #ccc',
    display: 'flex',
    justifyContent: 'space-between'
  }
};

function initialQuery() {
  return {
    searchText: '',
    grade: ALL,
    house: ALL,
    eventNoteTypeId: ALL,
    scopeKey: ALL,
    timeRangeKey: TIME_RANGE_SCHOOL_YEAR,
    limit: 50
  };
}

function oneOrMoreResult(value) {
  return oneOrMore(value, 'result', 'results');
}

function oneOrMore(value, singular, plural) {
  if (value === 1) return `${value} ${singular}`;
  return `${value} ${plural}`;
}

// Quick and dirty grabbing the list of words
function wordsFromEventNoteCards(feedCards) {
  return _.flatMap(feedCards, feedCard => {
    if (feedCard.type !== 'event_note_card') return [];
    return feedCard.json.text.split(' ');
  });
}
