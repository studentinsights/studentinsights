import React from 'react';
import PropTypes from 'prop-types';
import {updateGlobalStylesToTakeFullHeight} from '../helpers/globalStylingWorkarounds';
import {supportsHouse} from '../helpers/PerDistrict';
import {ALL} from '../components/SimpleFilterSelect';
import SectionHeading from '../components/SectionHeading';
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
    this.renderResults = this.renderResults.bind(this);
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
          query={query}
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
        renderFn={this.renderResults}
      />
    );
  }

  renderResults(json) {
    return <pre>{JSON.stringify(json, null, 2)}</pre>;
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
