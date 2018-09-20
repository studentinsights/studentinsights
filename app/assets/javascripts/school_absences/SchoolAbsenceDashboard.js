import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import {
  supportsExcusedAbsences,
  supportsHouse,
  shouldDisplayHouse,
  supportsCounselor,
  shouldDisplayCounselor
} from '../helpers/PerDistrict';
import SectionHeading from '../components/SectionHeading';
import EscapeListener from '../components/EscapeListener';
import FilterBar from '../components/FilterBar';
import SelectTimeRange, {
  momentRange,
  timeRangeText,
  TIME_RANGE_45_DAYS_AGO
} from '../components/SelectTimeRange';
import {ALL} from '../components/SimpleFilterSelect';
import SelectGrade from '../components/SelectGrade';
import SelectHouse from '../components/SelectHouse';
import SelectCounselor from '../components/SelectCounselor';
import DashboardBarChart from '../school_administrator_dashboard/DashboardBarChart';
import StudentsTable from './StudentsTable';
import SelectExcusedAbsences, {
  EXCLUDE_EXCUSED_ABSENCES,
  ALL_ABSENCES
} from './SelectExcusedAbsences';





import LightProfileTab, {LightShoutNumber} from '../student_profile/LightProfileTab';

export default class SchoolAbsenceDashboard extends React.Component {

  constructor(props, context) {
    super(props);

    this.state = initialState(props, context);
    this.onResetFilters = this.onResetFilters.bind(this);
    this.onExcusedAbsencesChanged = this.onExcusedAbsencesChanged.bind(this);
    this.onGradeChanged = this.onGradeChanged.bind(this);
    this.onHouseChanged = this.onHouseChanged.bind(this);
    this.onCounselorChanged = this.onCounselorChanged.bind(this);
    this.onTimeRangeKeyChanged = this.onTimeRangeKeyChanged.bind(this);
    this.onClearHomeroomSelected = this.onClearHomeroomSelected.bind(this);
    this.onBarChartColumnClicked = this.onBarChartColumnClicked.bind(this);
  }

  shouldIncludeExcusedAbsences() {
    const {excusedAbsencesKey} = this.state;
    return excusedAbsencesKey === ALL_ABSENCES;
  }

  filteredStudents() {
    const {studentsWithAbsences} = this.props;
    const {homeroomLabel, grade, house, counselor} = this.state;
    return studentsWithAbsences.filter(student => {
      if (homeroomLabel !== null && student.homeroom_label !== homeroomLabel) return false;
      if (grade !== ALL && student.grade !== grade) return false;
      if (house !== ALL && student.house !== house) return false;
      if (counselor !== ALL && student.counselor !== counselor) return false;
      
      return true;
    });
  }

  filteredAbsences(absences, nowMoment) {
    const {timeRangeKey} = this.state;
    const range = momentRange(timeRangeKey, nowMoment);
    return absences.filter(absence => {
      if (!moment.utc(absence.occurred_at).isBetween(range[0], range[1])) return false;
      if (!this.shouldIncludeExcusedAbsences() && absence.excused) return false;
      return true;
    });
  }

  allGrades() {
    const {studentsWithAbsences} = this.props;
    return _.sortBy(_.uniq(_.compact(studentsWithAbsences.map(student => student.grade))));
  }

  allCounselors() {
    const {studentsWithAbsences} = this.props;
    return _.sortBy(_.uniq(_.compact(studentsWithAbsences.map(student => student.counselor))));
  }

  // Heuristic: any day that has any absences is a school day, days with perfect
  // attendance are holidays/weekends.
  schoolDaysCount() {
    const {studentsWithAbsences} = this.props;
    const allAbsences = _.flatMap(studentsWithAbsences, 'absences');
    return _.uniqBy(allAbsences, absence => moment.utc(absence.occurred_at).format('YYYYMMDD')).length;
  }

  // Compute attendance data for a set of students
  attendanceDataForStudents(students, nowMoment, schoolDaysCount) {
    const studentsCount = students.length;
    const absencesCount = students.reduce((count, student) => {
      return this.filteredAbsences(student.absences, nowMoment).length + count;
    }, 0);
    const studentDays = schoolDaysCount * studentsCount;
    const attendanceRate = (studentDays === 0)
      ? null
      : 100 * (studentDays - absencesCount) / studentDays;
    return {studentsCount, absencesCount, attendanceRate};
  }

  // Compute attendance data by homeroom, applying all filters
  homeroomChartData() {
    const {nowFn} = this.context;
    const nowMoment = nowFn();
    const filteredStudents = this.filteredStudents();
    const schoolDaysCount = this.schoolDaysCount();

    // Ordered bars for the chart
    // Partition by homeroom and compute each group
    const studentsByHomeroom = _.groupBy(filteredStudents, 'homeroom_label');
    const homeroomLabels = _.uniq(_.compact(Object.keys(studentsByHomeroom)));
    const unsortedHomeroomSeries = homeroomLabels.map(homeroomLabel => {
      const students = studentsByHomeroom[homeroomLabel];
      const {studentsCount, absencesCount, attendanceRate} = this.attendanceDataForStudents(students, nowMoment, schoolDaysCount);
      return {
        homeroomLabel,
        attendanceRate,
        absencesCount,
        studentsCount,
        y: attendanceRate,
        color: (homeroomLabel === this.state.homeroomLabel) ? 'orange' : null,
      };
    });
    const homeroomSeries = _.sortBy(unsortedHomeroomSeries, 'attendanceRate');

    return {homeroomLabels, homeroomSeries};
  }

  monthlyData() {
    const {nowFn} = this.context;
    const nowMoment = nowFn();
    const filteredStudents = this.filteredStudents();
    const schoolDaysCount = this.schoolDaysCount();
    return this.attendanceDataForStudents(filteredStudents, nowMoment, schoolDaysCount);
  }

  timeRangeText() {
    const {timeRangeKey} = this.state;
    return timeRangeText(timeRangeKey);
  }

  onTimeRangeKeyChanged(timeRangeKey) {
    this.setState({timeRangeKey});
  }

  onExcusedAbsencesChanged(excusedAbsencesKey) {
    this.setState({excusedAbsencesKey});
  }

  onGradeChanged(grade) {
    this.setState({grade});
  }

  onHouseChanged(house) {
    this.setState({house});
  }

  onCounselorChanged(counselor) {
    this.setState({counselor});
  }

  onResetFilters() {
    this.setState(initialState(this.props, this.context));
  }

  onClearHomeroomSelected() {
    this.setState({homeroomLabel: null});
  }

  onBarChartColumnClicked(highchartsEvent) {
    const {homeroomLabel} = highchartsEvent.point;
    this.setState({homeroomLabel});
  }

  render() {
    const {school} = this.props;
    return (
      <EscapeListener
        className="SchoolAbsenceDashboard"
        style={styles.root}
        onEscape={this.onResetFilters}
      >
        <SectionHeading>Absences at {school.name}</SectionHeading>
        <div className="SchoolDashboard-filter-bar">
          {this.renderFilterBar()}
        </div>
        <div className="SchoolDashboard-columns">
          <div className="SchoolDashboard-roster-column">
            {this.renderStudentAbsenceTable()}
          </div>
          <div className="SchoolDashboard-charts-column">
            {this.renderOverallData()}
            {this.renderHomeroomAbsenceChart()}
          </div>
        </div>
      </EscapeListener>
    );
  }

  renderFilterBar() {
    const {districtKey} = this.context;
    const {school} = this.props;
    const {timeRangeKey, excusedAbsencesKey, grade, house, counselor} = this.state;
    return (
      <div style={styles.filterBarContainer}>
        {supportsExcusedAbsences(districtKey)
          ? <FilterBar>
              <SelectExcusedAbsences
                excusedAbsencesKey={excusedAbsencesKey}
                onChange={this.onExcusedAbsencesChanged} />
              <SelectGrade
                style={styles.narrowSelect}
                grade={grade}
                grades={this.allGrades()}
                onChange={this.onGradeChanged} />
              {supportsHouse(districtKey) && shouldDisplayHouse(school) && (
                <SelectHouse
                  style={styles.narrowSelect}
                  house={house}
                  onChange={this.onHouseChanged} />
              )}
              {supportsCounselor(districtKey) && shouldDisplayCounselor(school) && (
                <SelectCounselor
                  style={styles.narrowSelect}
                  counselor={counselor}
                  counselors={this.allCounselors()}
                  onChange={this.onCounselorChanged} />
              )}
            </FilterBar>
          : <div /> /* empty element for justify-content: space-between */
        }
        <FilterBar labelText="Time range">
          <SelectTimeRange
            timeRangeKey={timeRangeKey}
            onChange={this.onTimeRangeKeyChanged} />
        </FilterBar>
      </div>
    );
  }

  renderStudentAbsenceTable() {
    const {nowFn} = this.context;
    const nowMoment = nowFn();
    const filteredStudents = this.filteredStudents();
    const studentTableRows = filteredStudents.map(student => {
      return {
        ...student,
        events: this.filteredAbsences(student.absences, nowMoment).length
      };
    });

    return (
      <StudentsTable
        rows={studentTableRows}
        incidentType='Absences' />
    );
  }

  renderOverallData() {
    const {attendanceRate} = this.monthlyData();
    const numberText = (attendanceRate)
      ? `${Math.round(attendanceRate, 0)}%`
      : '-';
    return (
      <div style={styles.upperRightContainer}>
        <LightProfileTab
          style={{width: 200, cursor: 'default'}}
          isSelected={true}
          intenseColor="#666"
          fadedColor="#ccc"
          text="Attendance">
            <LightShoutNumber number={numberText}>
              <div>attendance rate</div>
              <div>{this.timeRangeText().toLowerCase()}</div>
            </LightShoutNumber>
          </LightProfileTab>
      </div>
    );
  }

  renderHomeroomAbsenceChart() {
    const {homeroomSeries, homeroomLabels} = this.homeroomChartData();
    return (
      <EscapeListener escapeOnUnhandledClick={true} onEscape={this.onClearHomeroomSelected}>
        <DashboardBarChart
          id={'string'}
          categories={{categories: homeroomLabels}}
          seriesData={homeroomSeries}
          yAxisMin={80}
          yAxisMax={100}
          titleText={`Attendance by homeroom (${this.timeRangeText()})`}
          measureText={'Attendance rate (percent)'}
          tooltip={{
            // Highcharts parses this subset of HTML and re-renders it as SVG
            formatter() {
              const {attendanceRate, absencesCount, studentsCount, homeroomLabel} = this.point;
              return (
                `<div>
                  <div>Attendance rate: <b>${Math.round(attendanceRate)}%</b></div>
                  <br />
                  <div>Absences: <b>${absencesCount}</b></div>
                  <br />
                  <div>Students: <b>${studentsCount}</b></div>
                  <br />
                  <div>Homeroom: ${homeroomLabel}</div>
                </div>`
              );
            }
          }}
          onColumnClick={this.onBarChartColumnClicked}
        />
      </EscapeListener>
    );
  }
}
SchoolAbsenceDashboard.contextTypes = {
  nowFn: PropTypes.func.isRequired,
  districtKey: PropTypes.string.isRequired
};
SchoolAbsenceDashboard.propTypes = {
  studentsWithAbsences: PropTypes.array.isRequired,
  school: PropTypes.shape({
    name: PropTypes.string.isRequired,
    local_id: PropTypes.string.isRequired,
    school_type: PropTypes.string.isRequired
  }).isRequired
};

const styles = {
  root: {
    flex: 1,
    width: '100%',
    paddingLeft: 10,
    paddingRight: 10,
    display: 'flex',
    flexDirection: 'column'
  },
  filterBarContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  upperRightContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  narrowSelect: {
    width: '8em'
  }
};


function initialState(props, context) {
  const {districtKey} = context;
  const excusedAbsencesKey = supportsExcusedAbsences(districtKey)
    ? EXCLUDE_EXCUSED_ABSENCES
    : ALL_ABSENCES;
    
  return {
    excusedAbsencesKey,
    grade: ALL,
    house: ALL,
    counselor: ALL,
    timeRangeKey: TIME_RANGE_45_DAYS_AGO,
    homeroomLabel: null
  };
}