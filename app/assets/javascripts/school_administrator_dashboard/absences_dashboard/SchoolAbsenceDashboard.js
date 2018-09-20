import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import d3 from 'd3';
import moment from 'moment';
import {toMoment} from '../../helpers/toMoment';
import {
  supportsExcusedAbsences,
  supportsHouse,
  shouldDisplayHouse,
  supportsCounselor,
  shouldDisplayCounselor
} from '../../helpers/PerDistrict';
import SectionHeading from '../../components/SectionHeading';
import EscapeListener from '../../components/EscapeListener';
import FilterBar from '../../components/FilterBar';
import SelectTimeRange, {
  momentRange,
  timeRangeText,
  TIME_RANGE_45_DAYS_AGO
} from '../../components/SelectTimeRange';
import {ALL} from '../../components/SimpleFilterSelect';
import SelectGrade from '../../components/SelectGrade';
import SelectHouse from '../../components/SelectHouse';
import SelectCounselor from '../../components/SelectCounselor';
import DashboardHelpers from '../DashboardHelpers';
import StudentsTable from '../StudentsTable';
import DashboardBarChart from '../DashboardBarChart';
import SelectExcusedAbsences, {
  EXCLUDE_EXCUSED_ABSENCES,
  ALL_ABSENCES
} from './SelectExcusedAbsences';


import LightProfileTab, {LightShoutNumber} from '../../student_profile/LightProfileTab';

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

    // optimization for reducing repeated compute
    this.memoizedFilterDates = _.memoize(this.memoizedFilterDates.bind(this));
  }

  filteredStudents() {
    const {dashboardStudents} = this.props;
    const {homeroomLabel, grade, house, counselor} = this.state;
    return dashboardStudents.filter(student => {
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

  allCounselors() {
    const {dashboardStudents} = this.props;
    return _.sortBy(_.uniq(_.compact(dashboardStudents.map(student => student.counselor))));
  }

  // Heuristic: any day that has any absences is a school day, days with perfect
  // attendance are holidays/weekends.
  schoolDaysCount() {
    const {dashboardStudents} = this.props;
    const allAbsences = _.flatMap(dashboardStudents, 'absences');
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
    const homeroomLabels = _.sortBy(_.uniq(_.compact(Object.keys(studentsByHomeroom))));
    const homeroomSeries = homeroomLabels.map(homeroomLabel => {
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

    return {homeroomLabels, homeroomSeries};
  }

  monthlyData() {
    const {nowFn} = this.context;
    const nowMoment = nowFn();
    const filteredStudents = this.filteredStudents();
    const schoolDaysCount = this.schoolDaysCount();
    return this.attendanceDataForStudents(filteredStudents, nowMoment, schoolDaysCount);
  }

  shouldIncludeExcusedAbsences() {
    const {excusedAbsencesKey} = this.state;
    return excusedAbsencesKey === ALL_ABSENCES;
  }

  displayDates() {
    const {nowFn} = this.context;
    const {timeRangeKey} = this.state;
    const range = momentRange(timeRangeKey, nowFn());
    const rangeDateStrings = range.map(momentValue => momentValue.format('YYYY-MM-DD'));
    return this.memoizedFilterDates(rangeDateStrings);
  }

  memoizedFilterDates(rangeDateStrings) {
    const {dateRange} = this.props;
    const [startDateString, endDateString] = rangeDateStrings;
    return DashboardHelpers.filterDates(dateRange, startDateString, endDateString);
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
            {this.renderMonthlyAbsenceChart()}
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

  renderMonthlyAbsenceChart() {
    // const dailyAttendance = this.shouldIncludeExcusedAbsences()
    //   ? this.props.schoolAverageDailyAttendance
    //   : this.props.schoolAverageDailyAttendanceUnexcused;
    // const monthlyAttendance = monthlySchoolAttendance(this.displayDates(), dailyAttendance);
    // const filteredAttendanceSeries = Object.keys(monthlyAttendance).map( (month) => {
    //   const rawAvg = _.sum(monthlyAttendance[month])/monthlyAttendance[month].length;
    //   return Math.round(rawAvg*10)/10;
    // });
    // const categories = Object.keys(monthlyAttendance);
    const {attendanceRate} = this.monthlyData();
    const numberText = (attendanceRate)
      ? `${Math.round(attendanceRate, 0)}%`
      : '-';
    return (
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', flex: 1, backgroundColor: '#eee'}}></div>
        <LightProfileTab
          style={{width: 200, cursor: 'default'}}
          isSelected={true}
          intenseColor="#666"
          fadedColor="#ccc"
          onClick={() => {}}
          text="Attendance">
            <LightShoutNumber number={numberText}>
              <div>attendance rate</div>
              <div>{this.timeRangeText().toLowerCase()}</div>
            </LightShoutNumber>
          </LightProfileTab>
      </div>
    );

    // return (
    //   <div>
    //     <div>Absence rate: {Math.round(attendanceRate, 0)}%</div>
    //     <div>Absences: {absencesCount}</div>
    //   </div>
    // );
    // return (
    //     <DashboardBarChart
    //       id={'string'}
    //       categories={{categories: monthlyLabels}}
    //       seriesData={monthlySeries}
    //       yAxisMin={80}
    //       yAxisMax={100}
    //       titleText={`Average Attendance By Month (${this.timeRangeText()})`}
    //       measureText={'Attendance (Percent)'}
    //       tooltip={{
    //         pointFormat: 'Average Daily Attendance: <b>{point.y}</b>',
    //         valueSuffix: '%'}}
    //     />
    // );
  }

  renderHomeroomAbsenceChart() {
    const {homeroomSeries, homeroomLabels} = this.homeroomChartData();
    return (
      <EscapeListener escapeOnUnhandledClick={true} onEscape={this.onResetFilters}>
        <DashboardBarChart
          id={'string'}
          categories={{categories: homeroomLabels}}
          seriesData={homeroomSeries}
          yAxisMin={80}
          yAxisMax={100}
          titleText={`Average Attendance By Homeroom (${this.timeRangeText()})`}
          measureText={'Attendance (Percent)'}
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
  schoolAverageDailyAttendance: PropTypes.object.isRequired,
  schoolAverageDailyAttendanceUnexcused: PropTypes.object.isRequired,
  homeroomAverageDailyAttendance: PropTypes.object.isRequired,
  homeroomAverageDailyAttendanceUnexcused: PropTypes.object.isRequired,
  dashboardStudents: PropTypes.array.isRequired,
  schoolAbsenceEventsByDay: PropTypes.object.isRequired,
  schoolUnexcusedAbsenceEventsByDay: PropTypes.object.isRequired,
  dateRange: PropTypes.array.isRequired,
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
  narrowSelect: {
    width: '8em'
  }
};

//Monthly attendance for the school must be calculated after the range filter is applied
export function monthlySchoolAttendance(displayDates, schoolAverageDailyAttendance) {
  let monthlySchoolAttendance = {};
  //Use the filtered daterange to find the days to include
  displayDates.forEach((day) => {
    const date = moment.utc(day).date(1).format("YYYY-MM"); //first day of the month in which 'day' occurs
    if (schoolAverageDailyAttendance[day] !== undefined) { //school days are based on all absences so it's possible this is undefined when getting the total for unexcused absences
      (monthlySchoolAttendance[date] === undefined) ? //if there's nothing for this month yet
      monthlySchoolAttendance[date] = [schoolAverageDailyAttendance[day]] :
      monthlySchoolAttendance[date] = monthlySchoolAttendance[date].concat(schoolAverageDailyAttendance[day]);
    }
  });
  return monthlySchoolAttendance;
}

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