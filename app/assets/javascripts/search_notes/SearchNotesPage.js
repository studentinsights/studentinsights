import React from 'react';
import PropTypes from 'prop-types';
import {updateGlobalStylesToTakeFullHeight} from '../helpers/globalStylingWorkarounds';
import {supportsHouse} from '../helpers/PerDistrict';
import {ALL} from '../components/SimpleFilterSelect';
import SectionHeading from '../components/SectionHeading';
import FeedView from '../feed/FeedView';
import SearchNotesBar from './SearchNotesBar';
import SearchQueryFetcher from './SearchQueryFetcher';


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
    return (
      <SearchQueryFetcher
        key={JSON.stringify(query)}
        query={query}
        renderFn={this.renderQueryResults}
      />
    );
  }

  renderQueryResults(json) {
    const feedCards = json.event_note_cards;
    return (
      <div style={styles.queryResults}>
        {(json.meta.all_results_size === feedCards.length)
          ? <div style={styles.meta}>Showing all {feedCards.length} results.</div>
          : <div style={styles.meta}>About {json.meta.all_results_size} results total, showing first {feedCards.length}.</div>
        }
        <FeedView feedCards={feedCards} />
      </div>
    );
  }
}
SearchNotesPage.propTypes = {
  educatorId: PropTypes.number.isRequired,
  educatorLabels: PropTypes.arrayOf(PropTypes.string).isRequired
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
    width: '50%'
  },
  meta: {
    paddingTop: 5,
    color: '#aaa'
  }
};

function initialQuery() {
  return {
    searchText: '',
    grade: ALL,
    house: ALL,
    eventNoteTypeId: ALL,
    scopeKeyf: ALL,
    limit: null
  };
}
