import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {
  sortByString,
  sortByNumber,
  sortByDate,
  sortByCustomEnum,
  sortByActiveServices
} from '../helpers/SortHelpers';
import {eventNoteTypeTextMini, studentTableEventNoteTypeIds} from '../helpers/PerDistrict';
import {mergeLatestNoteFields} from '../helpers/latestNoteDateText';
import Cookies from 'js-cookie';


// Shows a homeroom roster, for K8 and HS homerooms.
class HomeroomTable extends React.Component {

  constructor(props) {
    super(props);

    const initialColumns = this.getInitialColumnsDisplayed();
    this.state = {
      columnsDisplayed: initialColumns,
      showColumnPicker: false,
      sortBy: 'first_name',
      sortType: 'string',
      sortDesc: true
    };

    this.onClickHeader = this.onClickHeader.bind(this);
    this.openColumnPicker = this.openColumnPicker.bind(this);
    this.closeColumnPicker = this.closeColumnPicker.bind(this);
    this.toggleColumn = this.toggleColumn.bind(this);
  }

  eventNoteTypeIds() {
    const {districtKey} = this.context;
    const {school} = this.props;
    const schoolType = school.school_type;
    return studentTableEventNoteTypeIds(districtKey, schoolType);
  }

  orderedStudents() {
    const sortedStudents = this.sortedStudents();

    if (!this.state.sortDesc) return sortedStudents.reverse();

    return sortedStudents;
  }

  sortedStudents() {
    const students = this.mergedStudentRows();
    const sortBy = this.state.sortBy;
    const sortType = this.state.sortType;
    let customEnum;

    switch(sortType) {
    case 'string':
      return students.sort((a, b) => sortByString(a, b, sortBy));
    case 'number':
      return students.sort((a, b) => sortByNumber(a, b, sortBy));
    case 'date':
      return students.sort((a, b) => sortByDate(a, b, sortBy));
    case 'grade':
      customEnum = ['PK', 'KF', '1', '2', '3', '4', '5', '6', '7', '8'];
      return students.sort((a, b) => sortByCustomEnum(a, b, sortBy, customEnum));
    case 'sped_level_of_need':
      customEnum = ['—', 'Low < 2', 'Low >= 2', 'Moderate', 'High'];
      return students.sort((a, b) => sortByCustomEnum(a, b, sortBy, customEnum));
    case 'limited_english_proficiency':
      customEnum = ['FLEP-Transitioning', 'FLEP', 'Fluent'];
      return students.sort((a, b) => sortByCustomEnum(a, b, sortBy, customEnum));
    case 'program_assigned':
      customEnum = ['Reg Ed', '2Way English', '2Way Spanish', 'Sp Ed'];
      return students.sort((a, b) => sortByCustomEnum(a, b, sortBy, customEnum));
    case 'active_services':
      return students.sort((a, b) => sortByActiveServices(a, b));
    default:
      return students;
    }
  }

  openColumnPicker() {
    this.setState({ showColumnPicker: true });
  }

  closeColumnPicker() {
    this.setState({ showColumnPicker: false });
  }

  toggleColumn(columnKey) {
    const columnsDisplayed = _.clone(this.state.columnsDisplayed);
    const columnKeyIndex = _.indexOf(columnsDisplayed, columnKey);

    const isColumnDisplayed = (columnKeyIndex > -1);

    if (isColumnDisplayed) {
      columnsDisplayed.splice(columnKeyIndex, 1);
    } else {
      columnsDisplayed.push(columnKey);
    }

    Cookies.set("columnsDisplayed", columnsDisplayed);

    this.setState({ columnsDisplayed: columnsDisplayed });
  }

  columnKeysToNames() {
    return {
      'supports': 'Supports',
      'program': 'Program',
      'sped': 'SPED & Disability',
      'language': 'Language',
      'star': 'STAR',
      'mcas': 'MCAS',
    };
  }

  columnKeys() {
    return Object.keys(this.columnKeysToNames());
  }

  columnNames() {
    return _.values(this.columnKeysToNames());
  }

  getInitialColumnsDisplayed() {
    return (
      Cookies.getJSON("columnsDisplayed") || this.columnKeys()
    );
  }

  mergedStudentRows() {
    const eventNoteTypeIds = this.eventNoteTypeIds();
    return this.props.rows
      .map(student => mergeLatestNoteFields(student, eventNoteTypeIds));
  }

  visitStudentProfile(id) {
    window.location.href = `/students/${id}`;
  }

  showStar() {
    const columnsDisplayed = this.state.columnsDisplayed;
    const starDisplayed = _.indexOf(columnsDisplayed, 'star') > -1;

    if (this.props.showStar === true && starDisplayed === true) return true;

    return false;
  }

  showMcas() {
    const columnsDisplayed = this.state.columnsDisplayed;
    const mcasDisplayed = _.indexOf(columnsDisplayed, 'mcas') > -1;

    if (this.props.showMcas === true && mcasDisplayed === true) return true;

    return false;
  }

  onClickHeader(sortBy, sortType) {
    if (sortBy === this.state.sortBy) {
      this.setState({ sortDesc: !this.state.sortDesc });
    } else {
      this.setState({ sortBy: sortBy, sortType: sortType });
    }
  }

  render() {
    return (
      <div>
        {this.renderColumnPickerArea()}
        <table id="roster-table" cellSpacing="0" cellPadding="5" className="sort-default">
          {this.renderHeaders()}
          {this.renderRows()}
        </table>
      </div>
    );
  }

  renderStarHeaders() {
    return (
    [
      <td colSpan="1" key="star_math_header">
          <p className="smalltype">
            STAR: Math
          </p>
        </td>,
      <td colSpan="1" key="star_reading_header">
          <p className="smalltype">
            STAR: Reading
          </p>
        </td>
    ]
    );
  }

  renderStarSubHeaders() {
    return (
    [
      <th className="sortable_header" key="star_math_sub_header"
          onClick={this.onClickHeader.bind(null, 'most_recent_star_math_percentile', 'number')}>
          <span className="table-header">Percentile</span>
        </th>,
      <th className="sortable_header" key="star_reading_sub_header"
          onClick={this.onClickHeader.bind(null, 'most_recent_star_reading_percentile', 'number')}>
          <span className="table-header">Percentile</span>
        </th>
    ]
    );
  }

  renderMcasHeaders() {
    return (
    [
      <td colSpan="2" key="mcas_math_header">
          <p className="smalltype">
            MCAS: Math
          </p>
        </td>,
      <td colSpan="2" key="mcas_ela_header">
          <p className="smalltype">
            MCAS: ELA
          </p>
        </td>
    ]
    );
  }

  renderMcasSubHeaders() {
    return (
    [
      <th className="sortable_header" key="mcas_math_sub_header_perf"
          onClick={this.onClickHeader.bind(null, 'most_recent_mcas_math_performance', 'string')}>
          <span className="table-header">Performance</span>
        </th>,
      <th className="sortable_header" key="mcas_math_sub_header_score"
          onClick={this.onClickHeader.bind(null, 'most_recent_mcas_math_scaled', 'number')}>
          <span className="table-header">Score</span>
        </th>,
      <th className="sortable_header" key="mcas_ela_sub_header_perf"
          onClick={this.onClickHeader.bind(null, 'most_recent_mcas_ela_performance', 'string')}>
          <span className="table-header">Performance</span>
        </th>,
      <th className="sortable_header" key="mcas_ela_sub_header_score"
          onClick={this.onClickHeader.bind(null, 'most_recent_mcas_ela_scaled', 'number')}>
          <span className="table-header">Score</span>
        </th>
    ]
    );
  }

  renderStarData(row) {
    if (!this.showStar()) return null;

    return (
    [
      <td key="star_math_percentile_rank">
          {row['most_recent_star_math_percentile'] || '—'}
        </td>,
      <td key="star_reading_percentile_rank">
          {row['most_recent_star_reading_percentile'] || '—'}
        </td>
    ]
    );
  }

  renderMcasData(row) {
    if (!this.showMcas()) return null;

    return (
    [
      <td key="mcas_math_performance_level">
          {row['most_recent_mcas_math_performance'] || '—'}
        </td>,
      <td key="mcas_math_scaled">
          {row['most_recent_mcas_math_scaled'] || '—'}
        </td>,
      <td key="mcas_ela performance_level">
          {row['most_recent_mcas_ela_performance'] || '—'}
        </td>,
      <td key="mcas_ela_scaled">
          {row['most_recent_mcas_ela_scaled'] || '—'}
        </td>
    ]
    );
  }

  renderSubHeader(columnKey, label, sortBy, sortType) {
    const columnsDisplayed = this.state.columnsDisplayed;
    const columnKeyIndex = _.indexOf(columnsDisplayed, columnKey);

    if (columnKeyIndex === -1) return null;

    return (
      <th className="sortable_header"
          onClick={this.onClickHeader.bind(null, sortBy, sortType)}>
        <span className="table-header">{label}</span>
      </th>
    );
  }

  renderSuperHeader(columnKey, columnSpan, label) {
    const columnsDisplayed = this.state.columnsDisplayed;
    const columnKeyIndex = _.indexOf(columnsDisplayed, columnKey);

    if (columnKeyIndex === -1) return null;

    if (!label) return (
      <td colSpan={columnSpan}></td>
    );

    return (
      <td colSpan={columnSpan}>
        <p className="smalltype">
          {label}
        </p>
      </td>
    );
  }

  renderNameSubheader() {
    return (
      <th className="name sortable_header"
          onClick={this.onClickHeader.bind(null, 'first_name', 'string')}>
        <span className="table-header">
          Name
        </span>
      </th>
    );
  }

  renderSubHeaders() {
    return (
      <tr className="column-names">
        {/* COLUMN HEADERS */}
        {this.renderNameSubheader()}
        {this.eventNoteTypeIds().map(eventNoteTypeId => (
          this.renderSubHeader('supports', `Last ${eventNoteTypeTextMini(eventNoteTypeId)}`, `latest_note_${eventNoteTypeId}`, 'date')
        ))}
        {this.renderSubHeader(
          'program', 'Program Assigned', 'program_assigned', 'program_assigned'
        )}
        {this.renderSubHeader(
          'sped', 'Disability', 'disability', 'string'
        )}
        {this.renderSubHeader(
          'sped', 'Level of Need', 'sped_level', 'number'
        )}
        {this.renderSubHeader(
          'sped', '504 Plan', 'plan_504', 'string'
        )}
        {this.renderSubHeader(
          'language', 'Fluency', 'limited_english_proficiency', 'limited_english_proficiency'
        )}
        {this.renderSubHeader(
          'language', 'Home Language', 'home_language', 'string'
        )}
        {(this.showStar()) ? this.renderStarSubHeaders() : null}
        {(this.showMcas()) ? this.renderMcasSubHeaders() : null}
      </tr>
    );
  }

  renderHeaders() {
    const supportColumnCount = this.eventNoteTypeIds().length;
    return (
      <thead>
        <tr className="column-groups">
          {/*  TOP-LEVEL COLUMN GROUPS */}
          <td colSpan="1"></td>
          {this.renderSuperHeader('supports', supportColumnCount, 'Supports')}
          {this.renderSuperHeader('program', '1')}
          {this.renderSuperHeader('sped', '3', 'SPED & Disability')}
          {this.renderSuperHeader('language', '2', 'Language')}
          {this.renderSuperHeader('free-reduced', '1')}
          {(this.showStar()) ? this.renderStarHeaders() : null}
          {(this.showMcas()) ? this.renderMcasHeaders() : null}
        </tr>
        {this.renderSubHeaders()}
      </thead>
    );
  }

  renderDataCell(columnKey, data) {
    const columnsDisplayed = this.state.columnsDisplayed;
    const columnKeyIndex = _.indexOf(columnsDisplayed, columnKey);

    if (columnKeyIndex === -1) return null;

    return (
      <td>{data || '—'}</td>
    );
  }

  renderDataWithSpedTooltip(row) {
    return (
      <div className={row['sped_data']['sped_bubble_class']}>
        {row['sped_data']['sped_level']}
        <span className="tooltiptext">
          {row['sped_data']['sped_tooltip_message']}
        </span>
      </div>
    );
  }

  renderRow(row, index) {
    const fullName = `${row['first_name']} ${row['last_name']}`;
    const id = row["id"];
    const style = (index % 2 === 0)
                    ? { backgroundColor: '#FFFFFF' }
                    : { backgroundColor: '#F7F7F7' };

    return (
      <tr className="student-row"
          onClick={this.visitStudentProfile.bind(null, id)}
          key={id}
          style={style}>
        <td className="name">{fullName}</td>
        {this.eventNoteTypeIds().map(eventNoteTypeId => (
          this.renderDataCell('supports', row[eventNoteTypeTextMini(eventNoteTypeId)])
        ))}
        {this.renderDataCell('program', row['program_assigned'])}
        {this.renderDataCell('sped', row['disability'])}
        {this.renderDataCell('sped', this.renderDataWithSpedTooltip(row))}
        {this.renderDataCell('sped', row['plan_504'])}
        {this.renderDataCell('language', row['limited_english_proficiency'])}
        {this.renderDataCell('language', row['home_language'])}
        {this.renderStarData(row)}
        {this.renderMcasData(row)}
      </tr>
    );
  }

  renderRows() {
    if (!this.props.rows) return null;

    const rows = this.orderedStudents();

    return (
      <tbody>
        {rows.map((row, index) => this.renderRow(row, index))}
      </tbody>
    );
  }

  renderMenu() {
    return (
      <svg width="24px" height="6px" viewBox="0 0 24 6" version="1.1" >
        <g id="Roster" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" >
          <g id="Roster---home---add-1" transform="translate(-930.000000, -416.000000)" fill="#555555">
            <g id="menu" transform="translate(930.000000, 416.000000)">
              <circle id="Oval-137" cx="3" cy="3" r="3"></circle>
              <path d="M12,6 C13.6568542,6 15,4.65685425 15,3 C15,1.34314575 13.6568542,0 12,0 C10.3431458,0 9,1.34314575 9,3 C9,4.65685425 10.3431458,6 12,6 Z" id="Oval-138"></path>
              <circle id="Oval-139" cx="21" cy="3" r="3"></circle>
            </g>
          </g>
        </g>
      </svg>
    );
  }

  renderColumnPickerArea() {
    return (
      <div>
        <div onClick={this.openColumnPicker} id="column-picker-toggle">
          {this.renderMenu()}
        </div>
        {this.renderColumnPickerMenu()}
      </div>
    );
  }

  renderColumnSelect(columnKey) {
    const columnKeysToNames = this.columnKeysToNames();
    const columnName = columnKeysToNames[columnKey];

    const onToggleColumn = this.toggleColumn.bind(null, columnKey);

    const columnsDisplayed = this.state.columnsDisplayed;
    const isColumnDisplayed = (_.indexOf(columnsDisplayed, columnKey) > -1);

    if (isColumnDisplayed) return (
      <div key={columnKey}>
        <input type="checkbox" defaultChecked onClick={onToggleColumn}/>
        <label>{columnName}</label>
      </div>
    );

    return (
      <div key={columnKey}>
        <input type="checkbox" onClick={onToggleColumn}/>
        <label>{columnName}</label>
      </div>
    );
  }

  renderColumnSelectors() {
    const columnKeys = this.columnKeys();

    return columnKeys.map((key) => { return this.renderColumnSelect(key); });
  }

  renderColumnPickerMenu() {
    if (this.state.showColumnPicker === false) return null;

    return (
      <div id="column-picker">
        <p>
          Select columns
          <span className="close" onClick={this.closeColumnPicker}>
            close
          </span>
        </p>
        <form id="column-listing">
          <div id="column-template">
            {this.renderColumnSelectors()}
          </div>
        </form>
      </div>
    );
  }
}
HomeroomTable.contextTypes = {
  districtKey: PropTypes.string.isRequired
};
HomeroomTable.propTypes = {
  showStar: PropTypes.bool.isRequired,
  showMcas: PropTypes.bool.isRequired,
  rows: PropTypes.arrayOf(PropTypes.shape({
    event_notes_without_restricted: PropTypes.array.isRequired
  })).isRequired,
  school: PropTypes.shape({
    school_type: PropTypes.string.isRequired
  }).isRequired
};

export default HomeroomTable;
