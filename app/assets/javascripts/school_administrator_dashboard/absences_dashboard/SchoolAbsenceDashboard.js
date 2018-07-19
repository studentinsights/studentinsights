import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import DashboardHelpers from '../DashboardHelpers';
import StudentsTable from '../StudentsTable';
import DashboardBarChart from '../DashboardBarChart';
import DashRangeButtons from '../DashRangeButtons';
import DashButton from '../DashButton';
import SectionHeading from '../../components/SectionHeading';
import EscapeListener from '../../components/EscapeListener';
import FilterBar, {
  GradeSelect,
  TimeRangeSelect,
  ExcusedAbsencesSelect,
  HouseSelect,
  TIME_RANGE_45_DAYS_AGO,
  momentRange,
  EXCLUDE_EXCUSED_ABSENCES,
  ALL,
  timeRangeText
} from '../../components/FilterBar';
import {shouldDisplayHouse} from '../../helpers/PerDistrict';


export default class SchoolAbsenceDashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      filters: initialFilters(),

      showExcused: false,
      selectedHomeroom: null,
      // selectedRange: 'This School Year'
    };
    this.setStudentList = (highchartsEvent) => {
      this.setState({selectedHomeroom: highchartsEvent.point.category});
    };
    this.resetStudentList = () => {
      this.setState({selectedHomeroom: null});
    };
    this.onExcusedAbsencesChanged = this.onExcusedAbsencesChanged.bind(this);
    this.onGradeChanged = this.onGradeChanged.bind(this);
    this.onHouseChanged = this.onHouseChanged.bind(this);
    this.onTimeRangeChanged = this.onTimeRangeChanged.bind(this);
    this.onFiltersCleared = this.onFiltersCleared.bind(this);
  }


  // // Returns [startDateString, endDateString] like ['2017-08-15', '2018-03-23']
  // schoolYearDateRange() {
  //   //change this to change the maximum date range available for the dashboard
  //   // const fullYearDateRange = Object.keys(this.props.schoolAbsenceEventsByDay).sort();
  //   const now = moment.utc();
  //   // return DashboardHelpers.filterDates(fullYearDateRange, DashboardHelpers.schoolYearStart(), today);
  //   return [DashboardHelpers.schoolYearStart(), now.format('YYYY-MM-DD')];
  // }

  // Returns an array of date strings describing the current time range
  // eg: ['2018-08-15', '2018-08-16', ...]
  dateRangeStrings() {
    const now = moment.utc();
    const {timeRangeKey} = this.state.filters;
    const range = momentRange(timeRangeKey, now);
    return createDateStringArrayForRange(range[0].format('YYYY-MM-DD'), range[1].format("YYYY-MM-DD"));
  }

  //Monthly attendance for the school must be calculated after the range filter is applied
  monthlySchoolAttendance(schoolAverageDailyAttendance) {
    let monthlySchoolAttendance = {};
    //Use the filtered daterange to find the days to include
    this.dateRangeStrings().forEach((day) => {
      const date = moment.utc(day).date(1).format("YYYY-MM"); //first day of the month in which 'day' occurs
      if (schoolAverageDailyAttendance[day] !== undefined) { //school days are based on all absences so it's possible this is undefined when getting the total for unexcused absences
        (monthlySchoolAttendance[date] === undefined) ? //if there's nothing for this month yet
        monthlySchoolAttendance[date] = [schoolAverageDailyAttendance[day]] :
        monthlySchoolAttendance[date] = monthlySchoolAttendance[date].concat(schoolAverageDailyAttendance[day]);
      }
    });
    return monthlySchoolAttendance;
  }

  monthlyHomeroomAttendance(dailyHomeroomAttendance) {
    let monthlyHomeroomAttendance = {};
    Object.keys(dailyHomeroomAttendance).forEach((homeroom) => {
      const rawAvg = _.sum(dailyHomeroomAttendance[homeroom])/dailyHomeroomAttendance[homeroom].length;
      const monthlyAverage = Math.round(rawAvg*10)/10;
      monthlyHomeroomAttendance[homeroom] = monthlyAverage;
    });

    return monthlyHomeroomAttendance;
  }

  filteredHomeroomAttendance(dailyHomeroomAttendance) {
    let filteredHomeroomAttendance = {};
    Object.keys(dailyHomeroomAttendance).forEach((homeroom) => {
      filteredHomeroomAttendance[homeroom] = this.dateRangeStrings().map((date) => {
        return dailyHomeroomAttendance[homeroom][date];
      });
    });
    return filteredHomeroomAttendance;
  }

  studentAbsenceCounts() {
    let studentAbsenceCounts = {};
    const eventsByDay = this.state.showExcused ? this.props.schoolAbsenceEventsByDay : this.props.schoolUnexcusedAbsenceEventsByDay;
    this.dateRangeStrings().forEach((day) => {
      _.each(eventsByDay[day], (absence) => {
        studentAbsenceCounts[absence.student_id] = studentAbsenceCounts[absence.student_id] || 0;
        studentAbsenceCounts[absence.student_id]++;
      });
    });
    return studentAbsenceCounts;
  }

  onExcusedAbsencesChanged(excusedAbsencesKey) {
    this.setState({filters: {
      ...this.state.filters,
      excusedAbsencesKey
    }});
  }
  
  onGradeChanged(grade) {
    this.setState({filters: {
      ...this.state.filters,
      grade
    }});
  }

  onHouseChanged(house) {
    this.setState({filters: {
      ...this.state.filters,
      house
    }});
  }

  onTimeRangeChanged(timeRangeKey) {
    this.setState({filters: {
      ...this.state.filters,
      timeRangeKey
    }});
  }

  onFiltersCleared() {
    this.setState({filters: initialFilters()});
  }

  render() {
    return (
      <EscapeListener className="SchoolAbsenceDashboard" style={styles.root} onEscape={this.onFiltersCleared}>
        <SectionHeading>Absences</SectionHeading>
        {this.renderFilters()}
        <pre>{JSON.stringify(this.state.filters)}</pre>
        <div className="DashboardContainer">
          <div className="DashboardRosterColumn">
            {this.renderStudentAbsenceTable()}
          </div>
          <div className="DashboardChartsColumn">
            {this.renderMonthlyAbsenceChart()}
            {this.renderHomeroomAbsenceChart()}
          </div>
        </div>
      </EscapeListener>
    );
  }

  renderFilters() {
    const {filters} = this.state;
    const {timeRangeKey, excusedAbsencesKey, house, grade} = filters;

    return (
      <div style={styles.filtersContainer}>
        <FilterBar style={{display: 'flex', alignItems: 'center'}}>
          <ExcusedAbsencesSelect excusedAbsencesKey={excusedAbsencesKey} onChange={this.onExcusedAbsencesChanged} />
          <GradeSelect grade={grade} onChange={this.onGradeChanged} />
          {shouldDisplayHouse && <HouseSelect house={house} onChange={this.onHouseChanged} />}
        </FilterBar>
        <FilterBar style={{display: 'flex', alignItems: 'center'}} labelText="Time period">
          <TimeRangeSelect
            wrapperStyle={{display: 'inline-block'}}
            timeRangeKey={timeRangeKey}
            onChange={this.onTimeRangeChanged} />
        </FilterBar>
      </div>
    );
  }

  // renderRangeSelector() {
  //   const {dateRange} = this.props;
  //   const today = moment.utc().format("YYYY-MM-DD");
  //   const ninetyDaysAgo = moment.utc().subtract(90, 'days').format("YYYY-MM-DD");
  //   const fortyFiveDaysAgo = moment.utc().subtract(45, 'days').format("YYYY-MM-DD");
  //   const schoolYearStart = DashboardHelpers.schoolYearStart();
  //   return (
  //     <div className="DashboardRangeButtons">
  //       <DashRangeButtons
  //         schoolYearFilter={() => this.setState({
  //           displayDates: DashboardHelpers.filterDates(dateRange, schoolYearStart, today),
  //           selectedRange: 'This School Year'})}
  //         ninetyDayFilter={() => this.setState({
  //           displayDates: DashboardHelpers.filterDates(dateRange, ninetyDaysAgo, today),
  //           selectedRange: 'Past 90 Days'})}
  //         fortyFiveDayFilter={() => this.setState({
  //           displayDates: DashboardHelpers.filterDates(dateRange, fortyFiveDaysAgo, today),
  //           selectedRange: 'Past 45 Days'})}/>
  //     </div>
  //   );
  // }

  // renderFilters() {
  //   return(
  //     <div className="ExcusedFilter">
  //       <DashButton
  //           buttonText={"Unexcused Absences Only"}
  //           onClick={() => this.setState({showExcused: false})}
  //           isSelected={!this.state.showExcused}/>
  //       <DashButton
  //         buttonText={"All Absences"}
  //         onClick={() => this.setState({showExcused: true})}
  //         isSelected={this.state.showExcused}/>
  //     </div>
  //   );
  // }

  renderStudentAbsenceTable() {
    const studentAbsenceCounts = this.studentAbsenceCounts();
    const studentsByHomeroom = DashboardHelpers.groupByHomeroom(this.props.dashboardStudents);
    const students = studentsByHomeroom[this.state.selectedHomeroom] || this.props.dashboardStudents;
    let rows =[];
    students.forEach((student) => {
      rows.push({
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        latest_note: student.latest_note,
        events: studentAbsenceCounts[student.id] || 0,
        grade: student.grade,
      });
    });

    return (
      <StudentsTable
        rows={rows}
        selectedCategory={this.state.selectedHomeroom}
        incidentType='Absences'
        incidentSubtitle={this.renderTimeRangeText()}
        resetFn={this.resetStudentList}/>
    );
  }

  renderMonthlyAbsenceChart() {
    const dailyAttendance = this.state.showExcused ?
                            this.props.schoolAverageDailyAttendance :
                            this.props.schoolAverageDailyAttendanceUnexcused;
    const monthlyAttendance = this.monthlySchoolAttendance(dailyAttendance);
    const filteredAttendanceSeries = Object.keys(monthlyAttendance).map( (month) => {
      const rawAvg = _.sum(monthlyAttendance[month])/monthlyAttendance[month].length;
      return Math.round(rawAvg*10)/10;
    });
    const categories = Object.keys(monthlyAttendance);

    return (
        <DashboardBarChart
          id = {'string'}
          categories = {{categories: categories}}
          seriesData = {filteredAttendanceSeries}
          yAxisMin = {80}
          yAxisMax = {100}
          titleText = {`Average Attendance By Month (${this.renderTimeRangeText()})`}
          measureText = {'Attendance (Percent)'}
          tooltip = {{
            pointFormat: 'Average Daily Attendance: <b>{point.y}</b>',
            valueSuffix: '%'}}
          onColumnClick = {this.resetStudentList}
          onBackgroundClick = {this.resetStudentList}/>
    );
  }

  renderHomeroomAbsenceChart() {
    const homeroomAverageDailyAttendance =  this.state.showExcused ?
                                            this.props.homeroomAverageDailyAttendance :
                                            this.props.homeroomAverageDailyAttendanceUnexcused;
    const filteredHomeroomAttendance = this.filteredHomeroomAttendance(homeroomAverageDailyAttendance); //remove dates outside of selected range
    const monthlyHomeroomAttendance = this.monthlyHomeroomAttendance(filteredHomeroomAttendance); //Average homeroom attendance by month
    const homerooms = Object.keys(monthlyHomeroomAttendance).sort((a,b) => { //sort homerooms by attendance, low to high
      return monthlyHomeroomAttendance[a] - monthlyHomeroomAttendance[b];
    });
    const homeroomSeries = homerooms.map((homeroom) => {
      return monthlyHomeroomAttendance[homeroom];
    });

    return (
        <DashboardBarChart
          id = {'string'}
          categories = {{categories: homerooms}}
          seriesData = {homeroomSeries}
          yAxisMin = {80}
          yAxisMax = {100}
          titleText = {`Average Attendance By Homeroom (${this.renderTimeRangeText()})`}
          measureText = {'Attendance (Percent)'}
          tooltip = {{
            pointFormat: 'Average Daily Attendance: <b>{point.y}</b>',
            valueSuffix: '%'}}
          onColumnClick = {this.setStudentList}
          onBackgroundClick = {this.resetStudentList}/>
    );
  }

  // User-facing text describing the selected time range
  renderTimeRangeText() {
    const {timeRangeKey} = this.state.filters;
    return timeRangeText(timeRangeKey);
  }
}

SchoolAbsenceDashboard.propTypes = {
  schoolAverageDailyAttendance: PropTypes.object.isRequired,
  schoolAverageDailyAttendanceUnexcused: PropTypes.object.isRequired,
  homeroomAverageDailyAttendance: PropTypes.object.isRequired,
  homeroomAverageDailyAttendanceUnexcused: PropTypes.object.isRequired,
  dashboardStudents: PropTypes.array.isRequired,
  schoolAbsenceEventsByDay: PropTypes.object.isRequired,
  schoolUnexcusedAbsenceEventsByDay: PropTypes.object.isRequired
};

const styles = {
  root: {
    margin: 10
  },
  filtersContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    margin: 10,
    marginTop: 20
  }
};

function initialFilters() {
  return {
    grade: ALL,
    house: ALL,
    timeRangeKey: TIME_RANGE_45_DAYS_AGO,
    excusedAbsencesKey: EXCLUDE_EXCUSED_ABSENCES
  };
}

function createDateStringArrayForRange(startDateString, endDateString) {
  const endDateNumber = parseInt(endDateString, 10);

  var dateStrings = []; // eslint-disable-line no-var
  var currentMoment = moment.utc(startDateString); // eslint-disable-line no-var
  while (parseInt(currentMoment.format('YYYYMMDD'), 10) < endDateNumber) {
    dateStrings.push(currentMoment);
    currentMoment.add(1, 'day');
  }
  return dateStrings;
}