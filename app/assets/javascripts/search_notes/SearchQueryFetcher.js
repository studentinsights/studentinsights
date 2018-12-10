import React from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import {apiFetchJson} from '../helpers/apiFetchJson';
import GenericLoader from '../components/GenericLoader';
import {momentRange} from '../components/SelectTimeRange';
import {ALL} from '../components/SimpleFilterSelect';


// Handles fetching and debouncing and caching for search results
export default class SearchQueryFetcher extends React.Component {
  constructor(props) {
    super(props);
    this.fetchNotes = this.fetchNotes.bind(this);
    this.renderNotes = this.renderNotes.bind(this);
  }

  fetchNotes() {
    const MIN_SEARCH_LENGTH = 3;
    
    const {searchText, grade, eventNoteTypeId, scopeKey, timeRangeKey, limit} = this.props.query;
    if (searchText.length < MIN_SEARCH_LENGTH) return Promise.resolve(null); // minimum search text length

    const {nowFn} = this.context;
    const nowMoment = nowFn();
    const startTimestamp = momentRange(timeRangeKey, nowMoment)[0].unix();
    const queryString = qs.stringify({
      start_time_utc: startTimestamp,
      end_time_utc: nowMoment.unix(),
      text: searchText,
      grade: valueOrNull(grade),
      event_note_type_id: valueOrNull(eventNoteTypeId),
      scope_key: valueOrNull(scopeKey),
      limit: valueOrNull(limit)
    });

    const url = `/api/search_notes/query_json?${queryString}`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="SearchQueryFetcher" style={styles.flexVertical}>
        <GenericLoader
          promiseFn={this.fetchNotes}
          style={styles.flexVertical}
          render={this.renderNotes} />
      </div>
    );
  }

  renderNotes(json) {
    const {renderFn} = this.props;
    return renderFn(json);
  }
}
SearchQueryFetcher.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
SearchQueryFetcher.propTypes = {
  query: PropTypes.shape({
    searchText: PropTypes.string.isRequired,
    grade: PropTypes.string,
    house: PropTypes.string,
    eventNoteTypeId: PropTypes.any.isRequired, // number, but magic ALL string also
    scopeKey: PropTypes.string,
    limit: PropTypes.number.isRequired,
    timeRangeKey: PropTypes.string.isRequired
  }).isRequired,
  renderFn: PropTypes.func.isRequired
};


const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  }
};

function valueOrNull(value) {
  return (value === ALL || value === undefined || value === null) ? null : value;
}