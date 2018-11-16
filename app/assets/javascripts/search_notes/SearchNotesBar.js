import React from 'react';
import PropTypes from 'prop-types';
import {DebounceInput} from 'react-debounce-input';
import FilterBar from '../components/FilterBar';
import SelectHouse from '../components/SelectHouse';
import SelectGrade from '../components/SelectGrade';
import SelectEventNoteType from '../components/SelectEventNoteType';


// UI for expressing a query for searching notes.
export default class SearchNotesBar extends React.Component {
  constructor(props) {
    super(props);

    this.onSearchChanged = this.onSearchChanged.bind(this);
    this.onGradeChanged = this.onGradeChanged.bind(this);
    this.onHouseChanged = this.onHouseChanged.bind(this);
    this.onEventNoteTypeIdChanged = this.onEventNoteTypeIdChanged.bind(this);
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

  render() {
    const {style} = this.props;

    return (
      <FilterBar className="SearchNotesBar" style={style} labelText="Search for">
        {this.renderSearch()}
        {this.renderGradeSelect()}
        {this.renderHouseSelect()}
        {this.renderEventNoteTypeSelect()}
      </FilterBar>
    );
  }

  renderSearch() {
    const {searchText} = this.props.query;
    const {debounceInputMs} = this.props;
    return (
      <DebounceInput
        minLength={3}
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
}
SearchNotesBar.propTypes = {
  query: PropTypes.shape({
    searchText: PropTypes.string.isRequired,
    grade: PropTypes.string,
    house: PropTypes.string,
    eventNoteTypeId: PropTypes.any.isRequired, // number, but magic ALL string also
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
