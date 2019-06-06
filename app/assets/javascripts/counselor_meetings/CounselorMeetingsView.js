import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {AutoSizer, Column, Table, SortDirection} from 'react-virtualized';
import {apiFetchJson, apiPostJson} from '../helpers/apiFetchJson';
import {supportsHouse, supportsCounselor} from '../helpers/PerDistrict';
import {toMoment, toMomentFromRailsDate} from '../helpers/toMoment';
import GenericLoader, {flexVerticalStyle} from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import Educator from '../components/Educator';
import {selection} from '../helpers/colors';
import StudentPhotoCropped from '../components/StudentPhotoCropped';
import FilterStudentsBar from '../my_students/FilterStudentsBar';
import {TIME_RANGE_ALL} from '../components/SelectTimeRange';
import Datepicker from '../components/Datepicker';
import StudentPhoto from '../components/StudentPhoto';
import {momentRange} from '../components/SelectTimeRange';
import CleanSlateFeedView from '../feed/CleanSlateFeedView';


export default class CounselorMeetingsView extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      selectedStudent: null,
      updatedMeetings: [], // layered on top of server data
      sortBy: 'name',
      sortDirection: SortDirection.ASC,
    };

    this.timeFilterFn = this.timeFilterFn.bind(this);
    this.onTableSort = this.onTableSort.bind(this);
    this.renderName = this.renderName.bind(this);
    this.renderLastSeen = this.renderLastSeen.bind(this);
    this.renderLastSeenBy = this.renderLastSeenBy.bind(this);
    this.renderCalendar = this.renderCalendar.bind(this);
    this.renderArrow = this.renderArrow.bind(this);
    this.renderStudentProfile = this.renderStudentProfile.bind(this);
    this.onStudentClicked = this.onStudentClicked.bind(this);
  }
  
  // Merge in `meetingMoment` and `meetingEducator`
  // and also merge in local client updates.
  studentsWithMeetings() {
    const {students, meetings, educatorsIndex} = this.props;
    const {updatedMeetings} = this.state;

    const allMeetings = updatedMeetings.concat(meetings);
    const meetingsByStudentId = _.groupBy(allMeetings, 'student_id');
    return students.map((student, index) => {
      const meetings = meetingsByStudentId[student.id] || [];
      const meeting = _.last(_.sortBy(meetings, meeting => toMomentFromRailsDate(meeting.meeting_date).unix()));
      const meetingMoment = (meeting)
        ? toMomentFromRailsDate(meeting.meeting_date)
        : null;
      const meetingEducator = (meeting)
        ? educatorsIndex[meeting.educator_id]
        : null;
      return {...student, meetingMoment, meetingEducator};
    });
  }

  timeFilterFn(student, timeRangeKey) {
    if (timeRangeKey === TIME_RANGE_ALL) return true; // no filter
    
    if (!student.meetingMoment) return false;
    const {nowFn} = this.context;
    const nowMoment = nowFn();
    const range = momentRange(timeRangeKey, nowMoment);
    return student.meetingMoment.isBetween(range[0], range[1], null, '[]'); // inclusive check
  }

  orderedStudents(students) {
    const {sortBy, sortDirection} = this.state;

    // map dataKey to an accessor/sort function
    const sortFns = {
      fallback(student) { return student[sortBy]; },
      name(student) { return `${student.last_name}, ${student.first_name}`; },
      educator(student) {
        return (student.meetingEducator === null)
          ? ''
          : student.meetingEducator.full_name;
      },
      last_seen: (student) => {
        const lastSeenNumber = (student.meetingMoment === null)
          ? Number.MAX_VALUE
          : this.howManyDaysAgo(student.meetingMoment);
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

  // optimistically update UI, and optimistically submit to server
  tellServer(studentId, datepickerDateText) {
    const {currentEducatorId} = this.props;
    const {updatedMeetings} = this.state;
    const meetingDateText = toMoment(datepickerDateText).format('YYYY-MM-DD');
    this.setState({
      updatedMeetings: updatedMeetings.concat([{
        student_id: studentId,
        educator_id: currentEducatorId,
        meeting_date: meetingDateText
      }])
    });
    return apiPostJson('/api/counselor_meetings', {
      student_id: studentId,
      meeting_date: meetingDateText,
    });
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

  // Toggle selection
  onStudentClicked(student) {
    const {selectedStudent} = this.state;
    const updatedSelectedStudent = (selectedStudent && selectedStudent.id === student.id)
      ? null
      : student;
    this.setState({selectedStudent: updatedSelectedStudent});
  }

  render() {
    const {districtKey} = this.context;
    const {schoolYear} = this.props;
    const students = this.studentsWithMeetings();

    return (
      <div style={{...flexVerticalStyle, margin: 10}}>
        <SectionHeading>Counselor Meetings {schoolYear}-{schoolYear+1}</SectionHeading>
        <FilterStudentsBar
          students={students}
          style={{...flexVerticalStyle, marginLeft: 10, marginTop: 20}}
          includeHouse={supportsHouse(districtKey)}
          includeTimeRange={true}
          includeCounselor={supportsCounselor(districtKey)}
          timeFilterFn={this.timeFilterFn}>
          {filteredStudents => this.renderContents(filteredStudents)}
        </FilterStudentsBar>
      </div>
    );
  }

  // Fix the min width of the left, flex the student profile if
  // there's more width.  This makes two parallel scrollable columns.
  renderContents(filteredStudents) {
    return (
      <div style={{flex: 1, display: 'flex', flexDirection: 'row'}}>
        <div style={{minWidth: 600}}>{this.renderTable(filteredStudents)}</div>
        <AutoSizer disableWidth>{({height}) => (
          <div style={{height, flex: 1, overflowY: 'scroll'}}>
            <div style={{paddingTop: 50, paddingLeft: 20, paddingRight: 10}}>
              {this.renderSelectedStudent(filteredStudents)}
            </div>
          </div>
        )}</AutoSizer>
      </div>
    );
  }

  renderTable(filteredStudents) {
    const {selectedStudent, sortDirection, sortBy} = this.state;
    const sortedStudents = this.orderedStudents(filteredStudents);
    const rowHeight = 60; // for two lines of student names

    return (
      <AutoSizer>
        {({width, height}) => (
          <Table
            width={width}
            height={height}
            headerHeight={rowHeight}
            headerStyle={{display: 'flex', fontWeight: 'bold', cursor: 'pointer'}}
            onRowClick={({rowData}) => this.onStudentClicked(rowData)}
            rowStyle={({index}) => {
              const isSelectedStudent = (
                (index !== -1) && // header row
                (selectedStudent) &&
                (selectedStudent.id === sortedStudents[index].id)
              );
              return {
                display: 'flex',
                alignItems: 'center',
                cursor: 'default',
                backgroundColor: isSelectedStudent ? selection : null
              };
            }}
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
              dataKey='last_seen'
              cellRenderer={this.renderLastSeen}
              width={120}
            />
            <Column
              label='Seen by'
              dataKey='educator'
              cellRenderer={this.renderLastSeenBy}
              width={100}
            />
            <Column
              label='Meeting Date'
              dataKey='meeting_date'
              disableSort={true}
              cellRenderer={this.renderCalendar}
              width={100}
            />
            <Column
              label=''
              dataKey='arrows'
              disableSort={true}
              cellRenderer={this.renderArrow}
              width={40}
            />
          </Table>
        )}
      </AutoSizer>
    );
  }

  renderArrow(cellProps) {
    const student = cellProps.rowData;
    return (
      <div
        onClick={this.onStudentClicked.bind(this, student)}
        style={{cursor: 'pointer', display: "flex", justifyContent: "center"}}>
        ▶
      </div>
    );
  }

  renderSelectedStudent(filteredStudents) {
    const student = this.state.selectedStudent;
    if (!student || !_.find(filteredStudents, {id: student.id})) return;

    const fetchUrl = `/api/counselor_meetings/student_feed_cards_json?student_id=${student.id}`;
    return (
      <div key={student.id} style={flexVerticalStyle}>
        <GenericLoader
          style={flexVerticalStyle}
          promiseFn={() => apiFetchJson(fetchUrl)}
          render={this.renderStudentProfile.bind(this, student)}
        />
      </div>
    );
  }

  renderStudentProfile(student, json) {
    const feedCards = json.feed_cards;
    return (
      <div style={{background: 'white', fontSize: 14}}>
        <StudentPhoto
          style={{height: 200, border: '2px solid #1b82ea'}}
          student={student}
          fallbackEl={<span>😃</span>}
        />
        <div style={{
          display: 'flex',
          flexDirection: 'row'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {this.renderBubble(student.meetingMoment)}
          </div>
          <div style={{
            marginLeft: 10,
            fontSize: 24,
            marginTop: 5
          }}> {student.first_name} {student.last_name}</div>
        </div>

        <SectionHeading style={{marginTop: 15}}>
          Notes for {student.first_name}
        </SectionHeading>
        <CleanSlateFeedView feedCards={feedCards} />
      </div>
    );
  }

  renderLastSeen(cellProps) {
    const student = cellProps.rowData;
    if (!student.meetingMoment) return null;

    const daysAgo = this.howManyDaysAgo(student.meetingMoment);    
    return (
      <div style={{display: 'flex'}}>
        {this.renderBubble(student.meetingMoment)}
        <div style={{fontSize: 14, marginLeft: 15}}>
          {daysAgo === 0
            ? <div>Today</div>
            : <div>{daysAgo} {(daysAgo === 1 ? 'day' : 'days')}</div>}
        </div>
      </div>
    );
  }

  renderLastSeenBy(cellProps) {
    const {meetingEducator} = cellProps.rowData;
    if (!meetingEducator) return null;

    return <Educator educator={meetingEducator} />;
  }

  renderBubble(meetingMoment) {
    const daysAgo = this.howManyDaysAgo(meetingMoment);
    const opacity = computeOpacity(daysAgo);
    return <div style={{
      opacity,
      height: 15,
      width: 15,
      marginTop: 3.5,
      backgroundColor: '#1b82ea',
      borderRadius: '50%',
      display: 'inline-block',
    }}></div>;
  }

  renderCalendar(cellProps){
    const student = cellProps.rowData;
    return (
      <div style={{display: "flex", justifyContent: "center"}}>
        <Datepicker
          className="Datepicker-global-override-no-padding" // see jquery_ui_datepicker.scss
          styles={{
            datepicker: { cursor: 'pointer' },
            input: { display: 'none' } // hide this visually
          }}
          value={''} // default to today
          onChange={datepickerDateText => this.tellServer(student.id, datepickerDateText)}
          datepickerOptions={{
            showOn: 'both',
            dateFormat: 'mm/dd/yy',
            minDate: undefined,
            maxDate: new Date
          }} />
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
}
CounselorMeetingsView.contextTypes = {
  districtKey: PropTypes.string.isRequired,
  nowFn: PropTypes.func.isRequired
};
CounselorMeetingsView.propTypes = {
  currentEducatorId: PropTypes.number.isRequired,
  schoolYear: PropTypes.number.isRequired,
  meetings: PropTypes.array.isRequired,
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
  })).isRequired,
  educatorsIndex: PropTypes.object.isRequired
};


const styles = {
  nameBlock: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  photo: {
    display: 'inline-block',
    marginLeft: 20,
    marginRight: 40
  },
  testButton: {
    border: '1px solid #ccc',
    background: '#eee',
    padding: 5
  }
};

function computeOpacity(daysAgo) {
  if (daysAgo <= 7) return 1;
  if (daysAgo <= 30) return .85;
  if (daysAgo <= 45) return .50;
  if (daysAgo <= 90) return .25;
  return .10;
}