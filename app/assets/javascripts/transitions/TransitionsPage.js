import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {AutoSizer, Column, Table, SortDirection} from 'react-virtualized';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {rankedByGradeLevel} from '../helpers/SortHelpers';
import {toSchoolYear} from '../helpers/schoolYear';
import {maybeCapitalize} from '../helpers/pretty';
import {shortSchoolName, supportsCounselor} from '../helpers/PerDistrict';
import {updateGlobalStylesToTakeFullHeight} from '../helpers/globalStylingWorkarounds';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import School from '../components/School';
import StudentPhotoCropped from '../components/StudentPhotoCropped';
import FilterStudentsBar from './FilterStudentsBar';
import {hasNote, isStarred} from './helpers';


export default class TransitionsPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchStudents = this.fetchStudents.bind(this);
    this.renderStudents = this.renderStudents.bind(this);
  }

  componentDidMount() {
    updateGlobalStylesToTakeFullHeight();
  }

  fetchStudents() {
    const url = `/api/second_transition_notes/transition_students_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="Transitions" style={styles.flexVertical}>
        <GenericLoader
          promiseFn={this.fetchStudents}
          style={styles.flexVertical}
          render={this.renderStudents} />
      </div>
    );
  }

  renderStudents(json) {
    const {students} = json;
    return <TransitionsView students={students} />;
  }
}

export class TransitionsView extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      sortBy: 'starred',
      sortDirection: SortDirection.ASC,
    };
    this.onTableSort = this.onTableSort.bind(this);
    this.renderName = this.renderName.bind(this);
    this.renderSchool = this.renderSchool.bind(this);
    this.renderNote = this.renderNote.bind(this);
    this.renderStarred = this.renderStarred.bind(this);
  }

  orderedStudents(students) {
    const {districtKey} = this.context;
    const {sortBy, sortDirection} = this.state;

    // map dataKey to an accessor/sort function
    const sortFns = {
      fallback(student) { return student[sortBy]; },
      
      name(student) { return `${student.last_name}, ${student.first_name}`; },
      school(student) { return shortSchoolName(districtKey, student.school.local_id); },
      grade(student) { return rankedByGradeLevel(student.grade); },
      counselor(student) { return maybeCapitalize(student.counselor); },
      note(student) { return hasNote(student); } ,
      starred(student) { return isStarred(student); }
    };
    const sortFn = sortFns[sortBy] || sortFns.fallback;
    const studentsByName = _.sortBy(students, sortFns.name);
    const sortedRows = _.sortBy(studentsByName, sortFn);

    // respect direction
    return (sortDirection == SortDirection.DESC) 
      ? sortedRows.reverse()
      : sortedRows;
  }

  onTableSort({defaultSortDirection, event, sortBy, sortDirection}) {
    if (sortBy === this.state.sortBy) {
      const oppositeSortDirection = (this.state.sortDirection == SortDirection.DESC)
        ? SortDirection.ASC
        : SortDirection.DESC;
      this.setState({ sortDirection: oppositeSortDirection });
    } else {
      this.setState({sortBy});
    }
  }

  render() {
    const {nowFn, districtKey} = this.context;
    const schoolYear = toSchoolYear(nowFn());
    const {students} = this.props;

    return (
      <div style={{...styles.flexVertical, margin: 10}}>
        <SectionHeading>School transitions for {schoolYear + 1}</SectionHeading>
        <FilterStudentsBar
          students={students}
          style={{...styles.flexVertical, marginLeft: 10, marginTop: 20}}
          includeCounselor={supportsCounselor(districtKey)}>
          {filteredStudents => this.renderTable(filteredStudents)}
        </FilterStudentsBar>
      </div>
    );
  }

  renderTable(filteredStudents) {
    const {districtKey} = this.context;
    const {sortDirection, sortBy} = this.state;
    const sortedStudents = this.orderedStudents(filteredStudents);
    const rowHeight = 60; // for two lines of student names

    // In conjuction with the filtering, this can lead to a warning in development.
    // See https://github.com/bvaughn/react-virtualized/issues/1119 for more.
    return (
      <AutoSizer style={{marginTop: 20}}>
        {({width, height}) => (
          <Table
            width={width}
            height={height}
            headerHeight={rowHeight}
            headerStyle={{display: 'flex', fontWeight: 'bold', cursor: 'pointer'}}
            rowStyle={{display: 'flex', alignItems: 'center'}}
            style={{fontSize: 14}}
            rowHeight={rowHeight}
            rowCount={sortedStudents.length}
            rowGetter={({index}) => sortedStudents[index]}
            sort={this.onTableSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            >
            <Column
              label='Name'
              dataKey='name'
              cellRenderer={this.renderName}
              width={280}
            />
            <Column
              label='School'
              dataKey='school'
              cellRenderer={this.renderSchool}
              width={150}
            />
            <Column
              label='Grade'
              dataKey='grade'
              width={100}
            />
            {supportsCounselor(districtKey) && 
              <Column
                label='Counselor'
                dataKey='counselor'
                cellDataGetter={({rowData}) => maybeCapitalize(rowData.counselor)}
                width={100}
              />
            }
            <Column
              label='Note?'
              dataKey='note'
              cellRenderer={this.renderNote}
              width={120} />
            <Column
              label={<span>Starred<br/> for discussion?</span>}
              dataKey='starred'
              cellRenderer={this.renderStarred}
              width={140} />
          </Table>
        )}
      </AutoSizer>
    );
  }

  renderNote(cellProps) {
    const student = cellProps.rowData;
    if (!hasNote(student)) return null;
    return this.renderStudentLink(student, <span style={{fontSize: 20}}>📝</span>);
  }

  renderStarred(cellProps) {
    const student = cellProps.rowData;
    if (!isStarred(student)) return null;
    return this.renderStudentLink(student, <span style={{fontSize: 20}}>⭐</span>);
  }

  renderName(cellProps) {
    const student = cellProps.rowData;
    return (
      <div style={styles.nameBlock}>
        {this.renderStudentLink(student, `${student.first_name} ${student.last_name}`)}
        {student.has_photo && (
          <StudentPhotoCropped
            studentId={student.id}
            style={styles.photo}
          />
        )}
      </div>
    );
  }

  renderSchool(cellProps) {
    const {school} = cellProps.rowData;
    const {districtKey} = this.context;
    const shortName = shortSchoolName(districtKey, school.local_id);
    return <School id={school.id} name={shortName} style={{marginRight: 10}} />;
  }

  renderHouse(cellProps) {
    const student = cellProps.rowData;
    return student.house && <HouseBadge house={student.house} showNameOnly={true} />;
  }

  renderStudentLink(student, children) {
    return <a style={{fontSize: 14}} href={`/students/${student.id}`} target="_blank" rel="noopener noreferrer">{children}</a>;
  }
}
TransitionsView.contextTypes = {
  districtKey: PropTypes.string.isRequired,
  nowFn: PropTypes.func.isRequired
};
TransitionsView.propTypes = {
  students: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    counselor: PropTypes.string,
    grade: PropTypes.string.isRequired,
    has_photo: PropTypes.bool.isRequired,
    school: PropTypes.shape({
      id: PropTypes.number.isRequired,
      local_id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
  })).isRequired
};


const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  nameBlock: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  photo: {
    display: 'inline-block',
    marginLeft: 20,
    marginRight: 20
  }
};
