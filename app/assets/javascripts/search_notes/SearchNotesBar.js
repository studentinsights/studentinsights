import React from 'react';
import PropTypes from 'prop-types';
import {DebounceInput} from 'react-debounce-input';
import FilterBar from '../components/FilterBar';
import SelectHouse from '../components/SelectHouse';
import SelectGrade from '../components/SelectGrade';
import SelectEventNoteType from '../components/SelectEventNoteType';
import SelectTimeRange, {
  TIME_RANGE_45_DAYS_AGO,
  TIME_RANGE_SCHOOL_YEAR,
  TIME_RANGE_FOUR_YEARS
} from '../components/SelectTimeRange';

// UI for expressing a query for searching notes.
export default class SearchNotesBar extends React.Component {
  constructor(props) {
    super(props);

    this.onSearchChanged = this.onSearchChanged.bind(this);
    this.onGradeChanged = this.onGradeChanged.bind(this);
    this.onHouseChanged = this.onHouseChanged.bind(this);
    this.onEventNoteTypeIdChanged = this.onEventNoteTypeIdChanged.bind(this);
    this.onTimeRangeKeyChanged = this.onTimeRangeKeyChanged.bind(this);
  }

  componentDidMount() {
    if (this.searchInputEl) this.searchInputEl.focus();
  }

  onSearchChanged(e) {
    this.props.onQueryChanged({searchText: e.target.value});
  }

  onGradeChanged(grade) {
    this.props.onQueryChanged({grade});
  }

  onHouseChanged(house) {
    this.props.onQueryChanged({house});
  }

  onEventNoteTypeIdChanged(eventNoteTypeId) {
    this.props.onQueryChanged({eventNoteTypeId});
  }

  onTimeRangeKeyChanged(timeRangeKey) {
    this.props.onQueryChanged({timeRangeKey});
  }

  render() {
    const {style} = this.props;

    return (
      <FilterBar className="SearchNotesBar" style={style} labelText="Search for">
        {this.renderSearch()}
        {this.renderGradeSelect()}
        {this.renderHouseSelect()}
        {this.renderEventNoteTypeSelect()}
        <div style={{display: 'flex', flex: 1, justifyContent: 'flex-end'}}>
          {this.renderTimeRangeSelect()}
        </div>
      </FilterBar>
    );
  }

  renderSearch() {
    const {searchText} = this.props.query;
    const {debounceInputMs} = this.props;
    return (
      <DebounceInput
        debounceTimeout={debounceInputMs}
        style={styles.search}
        inputRef={el => this.searchInputEl = el}
        placeholder={`Note text...`}
        value={searchText}
        onChange={this.onSearchChanged} />
    );
  }

  renderGradeSelect() {
    const {grade} = this.props.query;
    return (
      <SelectGrade
        grade={grade}
        onChange={this.onGradeChanged} />
    );
  }

  renderHouseSelect() {
    const {includeHouse} = this.props;
    if (!includeHouse) return null;

    const {house} = this.props.query;
    return (
      <SelectHouse
        house={house}
        onChange={this.onHouseChanged} />
    );
  }

  renderEventNoteTypeSelect() {
    const {eventNoteTypeId} = this.props.query;
    return (
      <SelectEventNoteType
        eventNoteTypeId={eventNoteTypeId}
        onChange={this.onEventNoteTypeIdChanged} />
    );
  }

  renderTimeRangeSelect() {
    const {timeRangeKey} = this.props.query;
    return (
      <SelectTimeRange
        timeRangeKey={timeRangeKey}
        timeRangeKeys={[
          TIME_RANGE_45_DAYS_AGO,
          TIME_RANGE_SCHOOL_YEAR,
          TIME_RANGE_FOUR_YEARS
        ]}
        onChange={this.onTimeRangeKeyChanged} />
    );
  }
}
SearchNotesBar.propTypes = {
  query: PropTypes.shape({
    searchText: PropTypes.string.isRequired,
    grade: PropTypes.string,
    house: PropTypes.string,
    eventNoteTypeId: PropTypes.any.isRequired, // number, but magic ALL string also
    timeRangeKey: PropTypes.string.isRequired
  }).isRequired,
  onQueryChanged: PropTypes.func.isRequired,
  includeHouse: PropTypes.bool.isRequired,
  debounceInputMs: PropTypes.number.isRequired,
  style: PropTypes.object
};

const styles = {
  // Matching react-select
  search: {
    display: 'inline-block',
    padding: '7px 7px 7px 12px',
    borderRadius: 4,
    border: '1px solid #ccc',
    marginLeft: 20,
    marginRight: 10,
    fontSize: 14,
    width: 220
  }
};
