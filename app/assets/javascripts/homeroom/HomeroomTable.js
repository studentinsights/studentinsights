import PropTypes from 'prop-types';
import React from 'react';
import {
  sortByString,
  sortByNumber,
  sortByDate,
  sortByCustomEnum,
  sortByActiveServices
} from '../helpers/SortHelpers';
import {eventNoteTypeTextMini} from '../helpers/eventNoteType';
import {studentTableEventNoteTypeIds, hasStudentPhotos} from '../helpers/PerDistrict';
import {mergeLatestNoteDateTextFields} from '../helpers/latestNote';
import StudentPhoto from '../components/StudentPhoto';


// Shows a homeroom roster, for K8 and HS homerooms.
export default class HomeroomTable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      sortBy: 'last_name',
      sortType: 'string',
      sortDesc: true
    };

    this.onClickHeader = this.onClickHeader.bind(this);
  }

  showStudentPhotos() {
    const {districtKey} = this.context;
    return hasStudentPhotos(districtKey);
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

  mergedStudentRows() {
    const eventNoteTypeIds = this.eventNoteTypeIds();
    return this.props.rows
      .map(student => mergeLatestNoteDateTextFields(
        student, student.event_notes_without_restricted, eventNoteTypeIds)
      );
  }

  visitStudentProfile(id) {
    window.location.href = `/students/${id}`;
  }

  maybeRenderStudentPhotoSubheader() {
    const showStudentPhotos = this.showStudentPhotos();
    if (!showStudentPhotos) return null;

    return (
      <th>
        <span className="table-header">
          Photo
        </span>
      </th>
    );
  }

  maybeRenderStudentPhotoHeader() {
    const showStudentPhotos = this.showStudentPhotos();
    if (!showStudentPhotos) return null;

    return(<td colSpan="1"></td>);
  }

  maybeRenderStudentPhoto(row) {
    const showStudentPhotos = this.showStudentPhotos();
    if (!showStudentPhotos) return null;

    return (
      <td>
        <StudentPhoto student={row} height={65} />
      </td>
    );
  }

  onClickHeader(sortBy, sortType) {
    if (sortBy === this.state.sortBy) {
      this.setState({ sortDesc: !this.state.sortDesc });
    } else {
      this.setState({ sortBy: sortBy, sortType: sortType });
    }
  }

  render() {
    const {style} = this.props;
    return (
      <div className="HomeroomTable" style={style}>
        <table id="roster-table" cellSpacing="0" cellPadding="5" className="sort-default">
          {this.renderHeaders()}
          {this.renderRows()}
        </table>
      </div>
    );
  }

  renderSubHeader(columnKey, label, sortBy, sortType) {
    return (
      <th
        key={sortBy}
        className="sortable_header"
        onClick={this.onClickHeader.bind(null, sortBy, sortType)}>
        <span className="table-header">{label}</span>
      </th>
    );
  }

  renderSuperHeader(columnKey, columnSpan, label) {
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
          onClick={this.onClickHeader.bind(null, 'last_name', 'string')}>
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
        {this.maybeRenderStudentPhotoSubheader()}
        {this.eventNoteTypeIds().map(eventNoteTypeId => (
          this.renderSubHeader('supports', `Last ${eventNoteTypeTextMini(eventNoteTypeId)}`, `latest_note_${eventNoteTypeId}_date_text`, 'date')
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
          {this.maybeRenderStudentPhotoHeader()}
          {this.renderSuperHeader('supports', supportColumnCount, 'Supports')}
          {this.renderSuperHeader('program', '1')}
          {this.renderSuperHeader('sped', '3', 'SPED & Disability')}
          {this.renderSuperHeader('language', '2', 'Language')}
          {this.renderSuperHeader('free-reduced', '1')}
        </tr>
        {this.renderSubHeaders()}
      </thead>
    );
  }

  renderDataCell(columnKey, data, options = {}) {
    return (
      <td key={options.key}>{data || '—'}</td>
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
    const fullName = `${row['last_name']}, ${row['first_name']}`;
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
        {this.maybeRenderStudentPhoto(row)}
        {this.eventNoteTypeIds().map(eventNoteTypeId => {
          const key = `latest_note_${eventNoteTypeId}_date_text`;
          return this.renderDataCell('supports', row[key], {key});
        })}
        {this.renderDataCell('program', row['program_assigned'])}
        {this.renderDataCell('sped', row['disability'])}
        {this.renderDataCell('sped', this.renderDataWithSpedTooltip(row))}
        {this.renderDataCell('sped', row['plan_504'])}
        {this.renderDataCell('language', row['limited_english_proficiency'])}
        {this.renderDataCell('language', row['home_language'])}
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
}

HomeroomTable.contextTypes = {
  districtKey: PropTypes.string.isRequired
};
HomeroomTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({
    event_notes_without_restricted: PropTypes.array.isRequired
  })).isRequired,
  school: PropTypes.shape({
    school_type: PropTypes.string
  }).isRequired,
  style: PropTypes.object
};

