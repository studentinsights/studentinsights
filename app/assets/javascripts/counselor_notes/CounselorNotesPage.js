import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';
import {AutoSizer, Column, Table, SortDirection} from 'react-virtualized';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {rankedByGradeLevel} from '../helpers/SortHelpers';
import {supportsHouse, supportsCounselor} from '../helpers/PerDistrict';
import {prettyProgramOrPlacementText} from '../helpers/specialEducation';
import {updateGlobalStylesToTakeFullHeight} from '../helpers/globalStylingWorkarounds';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import HouseBadge from '../components/HouseBadge';
import School from '../components/School';
import StudentPhotoCropped from '../components/StudentPhotoCropped';
import FilterStudentsBar from '../my_students/FilterStudentsBar';

export default class CounselorNotesPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchStudents = this.fetchStudents.bind(this);
    this.renderStudents = this.renderStudents.bind(this);
  }

  componentDidMount() {
    updateGlobalStylesToTakeFullHeight();
  }

  fetchStudents() {
    const url = `/api/educators/my_students_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="CounselorNotesPage" style={styles.flexVertical}>
        <GenericLoader
          promiseFn={this.fetchStudents}
          style={styles.flexVertical}
          render={this.renderStudents} />
      </div>
    );
  }

  renderStudents(json) {
    const {students} = json;
    return <CounselorNotesPageView students={students} />;
  }
}


export class CounselorNotesPageView extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      sortBy: 'name',
      sortDirection: SortDirection.ASC,
    };
    this.onTableSort = this.onTableSort.bind(this);
    this.renderName = this.renderName.bind(this);
    this.renderSchool = this.renderSchool.bind(this);
    this.renderLastSeen = this.renderLastSeen.bind(this);
  }

  // This is fake data for now.
  studentsWithMeetings() {
    const {students} = this.props;
    return students.map((student, index) => {
      const nDaysAgo = ((index % 5) * (Math.random() * 20));
      return {
        ...student,
        meetingMoment: (Math.random() < 0.80) ? moment.utc().subtract(nDaysAgo, 'days') : null
      };
    });
  }

  orderedStudents(students) {
    const {sortBy, sortDirection} = this.state;

    // map dataKey to an accessor/sort function
    const sortFns = {
      fallback(student) { return student[sortBy]; },
      name(student) { return `${student.last_name}, ${student.first_name}`; },
      lastseen: (student) => {
        const lastSeenNumber = (student.meetingMoment === null)
          ? 10000
          : this.howManyDaysAgo(student.meetingMoment);

        console.log(student.meetingMoment, lastSeenNumber);
        return lastSeenNumber;
      }
    };
    const sortFn = sortFns[sortBy] || sortFns.fallback;
    const sortedRows = _.sortBy(students, sortFn);

    // respect direction
    return (sortDirection == SortDirection.DESC) 
      ? sortedRows.reverse()
      : sortedRows;
  }

  // Returns a number saying how many days ago
  // the `meetingMoment` was.
  howManyDaysAgo(meetingMoment) {
    const {nowFn} = this.context;
    return nowFn().clone().diff(meetingMoment, 'days');
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
    const {districtKey} = this.context;
    const students = this.studentsWithMeetings();

    return (
      <div style={{...styles.flexVertical, margin: 10}}>
        <SectionHeading>Meetings 2019</SectionHeading>
        <FilterStudentsBar
          students={students}
          style={{...styles.flexVertical, marginLeft: 10, marginTop: 20}}
          includeHouse={supportsHouse(districtKey)}
          includeTimeRange={true}
          includeCounselor={supportsCounselor(districtKey)}>
          {filteredStudents => this.renderTable(filteredStudents)}
        </FilterStudentsBar>
      </div>
    );
  }

  renderTable(filteredStudents) {
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
              width={260}
            />
            <Column
              label='Last Seen'
              dataKey='lastseen'
              cellRenderer={this.renderLastSeen}
              width={160}
            />
            <Column
              label='Meeting Date'
              dataKey='meetingdate'
              cellRenderer={this.renderCalendar}
              width={100}
            />
            <Column
              label=''
              dataKey='arrows'
              cellRenderer={this.renderArrow}
              width={75}
            />
            
          </Table>
        )}
      </AutoSizer>
    );
  }
  renderArrow(cellProps) {
    return(
      <div style={{display: "flex", justifyContent: "center"/*, color: "#3177c9"*/}}>
        ▶
      </div>
    );
  }

  renderLastSeen(cellProps) {
    const student = cellProps.rowData;
    if (student.meetingMoment === null) return null;

    const daysAgo = this.howManyDaysAgo(student.meetingMoment);
    const opacity = computeOpacity(daysAgo);

    return (
      <div>
        <div style={{opacity: opacity, height: "15px", width: "15px", marginTop: "3.5px", backgroundColor: "#1b82ea", borderRadius: "50%", display: "inline-block", float: "left"}}></div>
        <div style={{fontSize: 14, float: "left", marginLeft: "15px"}}>
          {daysAgo === 0
            ? <div>Today</div>
            : <div>{daysAgo} {(daysAgo === 1 ? 'day' : 'days')}</div>}
        </div>
      </div>
    );
  }
  renderCalendar(cellProps){
    return (
      <div style={{display: "flex", justifyContent: "center"}}>
        <img style={{width: "25px", height: "25px"}} src="https://banner2.kisspng.com/20180403/xqq/kisspng-solar-calendar-symbol-computer-icons-encapsulated-calendar-icon-5ac41db876fe09.0405027315228021044874.jpg"></img>
      </div>
    );
  }
  renderName(cellProps) {
    const student = cellProps.rowData;
    return (
      <div style={styles.nameBlock}>
        <a style={{fontSize: 14}} href={`/students/${student.id}`} target="_blank" rel="noopener noreferrer">{student.first_name} {student.last_name}</a>
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
    const student = cellProps.rowData;
    return <School {...student.school} style={{marginRight: 10}} />;
  }

  renderHouse(cellProps) {
    const student = cellProps.rowData;
    return student.house && <HouseBadge house={student.house} showNameOnly={true} />;
  }

  renderProgram(cellProps) {
    const student = cellProps.rowData;
    return <div style={{marginRight: 10}}>{prettyProgramOrPlacementText(student)}</div>;
  }
}
CounselorNotesPageView.contextTypes = {
  districtKey: PropTypes.string.isRequired,
  nowFn: PropTypes.func.isRequired
};
CounselorNotesPageView.propTypes = {
  students: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    house: PropTypes.string,
    counselor: PropTypes.string,
    grade: PropTypes.string.isRequired,
    has_photo: PropTypes.bool.isRequired,
    school: PropTypes.shape({
      id: PropTypes.number.isRequired,
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
    marginRight: 40
  }
};

function computeOpacity(daysAgo) {
  if (daysAgo <= 7) return 1;
  if (daysAgo <= 30) return .85;
  if (daysAgo <= 45) return .50;
  if (daysAgo <= 90) return .25;
  return .10;
}