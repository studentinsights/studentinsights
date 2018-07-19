import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import d3 from 'd3';
import SectionHeading from '../../components/SectionHeading';
import EscapeListener from '../../components/EscapeListener';
import FilterBar from '../../components/FilterBar';
import SelectGrade from '../../components/SelectGrade';
import SelectTimeRange, {momentRange, TIME_RANGE_45_DAYS_AGO, timeRangeText} from '../../components/SelectTimeRange';
import SelectExcusedAbsences, {EXCLUDE_EXCUSED_ABSENCES} from '../../components/SelectExcusedAbsences';
import SelectHouse from '../../components/SelectHouse';
import {ALL} from '../../components/SimpleFilterSelect';
import {shouldDisplayHouse} from '../../helpers/PerDistrict';
import {rankedByGradeLevel} from '../../helpers/SortHelpers';
import {allGrades, gradeText} from '../../helpers/gradeText';
import {firstsOfTheMonthWithinRange} from '../../helpers/GraphHelpers';
import BreakdownBar from '../../components/BreakdownBar';
import DashboardHelpers from '../DashboardHelpers';
import StudentsTable from '../StudentsTable';
import DashboardBarChart from '../DashboardBarChart';
import DashRangeButtons from '../DashRangeButtons';
import DashButton from '../DashButton';


export default class SchoolAbsenceDashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      filters: initialFilters(),

      // showExcused: false,
      selectedHomeroom: null,
      // selectedRange: 'This School Year'
    };
    this.setStudentList = (highchartsEvent) => {
      this.setState({selectedHomeroom: highchartsEvent.point.category});
    };
    this.resetStudentList = () => {
      this.setState({selectedHomeroom: null});
    };
    this.filteredAbsences = this.filteredAbsences.bind(this);
    this.onExcusedAbsencesChanged = this.onExcusedAbsencesChanged.bind(this);
    this.onGradeChanged = this.onGradeChanged.bind(this);
    this.onHouseChanged = this.onHouseChanged.bind(this);
    this.onTimeRangeChanged = this.onTimeRangeChanged.bind(this);
    this.onFiltersCleared = this.onFiltersCleared.bind(this);
  }

  momentRange() {
    const now = moment.utc();
    const {timeRangeKey} = this.state.filters;
    return momentRange(timeRangeKey, now);
  }

  filteredStudents(students) {
    const {grade, house} = this.state.filters;
    return students.filter(student => {
      if (student.grade !== grade && grade !== ALL) return false;
      if (student.house !== house && house !== ALL) return false;
      return true;
    });
  }

  // Does not filter by student
  filteredAbsences(absences) {
    const {excusedAbsencesKey} = this.state.filters;
    const range = this.momentRange();
    return absences.filter(absence => {
      if (!moment.utc(absence.occurred_at).isBetween(range[0], range[1])) return false;
      if (absence.excused === true && excusedAbsencesKey === EXCLUDE_EXCUSED_ABSENCES) return false;
      return true;
    });
  }












  // Returns an array of date strings describing the current time range
  // eg: ['2018-08-15', '2018-08-16', ...]
  dateRangeStrings() {
    const range = this.momentRange();
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
    // What data should we consider, given the filters?
    const students = this.filteredStudents(this.props.dashboardStudents);
    const absences = this.filteredAbsences(_.flatten(students.map(student => student.absences)));

    return (
      <EscapeListener className="SchoolAbsenceDashboard" style={styles.root} onEscape={this.onFiltersCleared}>
        <SectionHeading>Absences</SectionHeading>
        {this.renderFilters()}
        {this.renderBreakdownForGrade(students, absences)}
        <div className="DashboardContainer">
          <div className="DashboardRosterColumn">
            {this.renderStudentAbsenceTable(students, absences)}
          </div>
          <div className="DashboardChartsColumn">
            {this.renderMonthlyAbsenceChart(students, absences)}
            {this.renderHomeroomAbsenceChart(students, absences)}
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
          <SelectExcusedAbsences excusedAbsencesKey={excusedAbsencesKey} onChange={this.onExcusedAbsencesChanged} />
          <SelectGrade grade={grade} onChange={this.onGradeChanged} />
          {shouldDisplayHouse && <SelectHouse house={house} onChange={this.onHouseChanged} />}
        </FilterBar>
        <FilterBar style={{display: 'flex', alignItems: 'center'}} labelText="Time period">
          <SelectTimeRange
            wrapperStyle={{display: 'inline-block'}}
            timeRangeKey={timeRangeKey}
            onChange={this.onTimeRangeChanged} />
        </FilterBar>
      </div>
    );
  }

  renderStudentAbsenceTable(students, absences) {
    const rows = studentsWithEventsCount(students, absences);
    return (
      <StudentsTable
        rows={rows}
        selectedCategory={this.state.selectedHomeroom}
        incidentType='Absences'
        incidentSubtitle={this.renderTimeRangeText()}
        resetFn={this.resetStudentList}/>
    );
  }

  
  renderBreakdownForGrade(students, absences) {
    const items = breakdownItemsForDimension(students, {
      accessorFn: student => student.grade,
      sortFn: rankedByGradeLevel,
      filterAbsences: this.filteredAbsences
    });

    return <BreakdownBar
      items={items}
      style={{width: 400}}
      height={10}
      labelTop={20}
      innerStyle={{fontSize: 10}}
      labelFn={item => gradeText(item.key)} />;
  }

  renderMonthlyAbsenceChart(students, absences) {
    const firstsOfTheMonth = firstsOfTheMonthWithinRange(...this.momentRange());
    const categories = firstsOfTheMonth.map(firstMoment => firstMoment.format('YYYY-MM-DD'));
    const countsByMonth = _.countBy(absences, absence => moment.utc(absence.occurred_at).format('YYYY-MM'));
    const series = firstsOfTheMonth.map(firstMoment => countsByMonth[firstMoment.format('YYYY-MM')]);

    // const dailyAttendance = this.state.showExcused ?
    //                         this.props.schoolAverageDailyAttendance :
    //                         this.props.schoolAverageDailyAttendanceUnexcused;
    // const monthlyAttendance = this.monthlySchoolAttendance(dailyAttendance);
    // const filteredAttendanceSeries = Object.keys(monthlyAttendance).map( (month) => {
    //   const rawAvg = _.sum(monthlyAttendance[month])/monthlyAttendance[month].length;
    //   return Math.round(rawAvg*10)/10;
    // });
    // const categories = Object.keys(monthlyAttendance);

    return (
        <DashboardBarChart
          id = {'string'}
          categories = {{categories: categories}}
          seriesData = {series}
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
    return <div>NOT YET</div>;
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
  // schoolAverageDailyAttendance: PropTypes.object.isRequired,
  // schoolAverageDailyAttendanceUnexcused: PropTypes.object.isRequired,
  // homeroomAverageDailyAttendance: PropTypes.object.isRequired,
  // homeroomAverageDailyAttendanceUnexcused: PropTypes.object.isRequired,
  dashboardStudents: PropTypes.array.isRequired,
  // schoolAbsenceEvents: PropTypes.array.isRequired,
  // schoolAbsenceEventsByDay: PropTypes.object.isRequired,
  // schoolUnexcusedAbsenceEventsByDay: PropTypes.object.isRequired
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

// Add in an `events` property to each student, counting their absences.
function studentsWithEventsCount(students, absences) {
  const countByStudent = _.countBy(absences, absence => absence.student_id);
  return students.map(student => {
    return {...student, events: countByStudent[student.id] || 0 };
  });
}


function breakdownItemsForDimension(students, options = {}) {
  const {accessorFn, sortFn, filterAbsences} = options;
  const studentsByDimension = _.groupBy(students, accessorFn);
  const absenceCountByDimension = _.map(studentsByDimension, (students, value) => {
    const count = students.reduce((sum, student) => sum + filterAbsences(student.absences).length, 0);
    return {dimension: value, count};
  });
  const sortedCountByDimension = _.sortBy(absenceCountByDimension, countForDimension => sortFn(countForDimension.dimension));

  // UI
  const colorScale = d3.scale.ordinal()
    .domain(allGrades())
    .range([
      '#40004b',
      '#762a83',
      '#9970ab',
      '#c2a5cf',
      '#e7d4e8',
      '#f7f7f7',
      '#d9f0d3',
      '#a6dba0',
      '#5aae61',
      '#1b7837',
      '#00441b',
    ]);
  return sortedCountByDimension.reduce((items, countForDimension) => {
    const lastRight = items.length === 0 ? 0 : _.last(items).left + _.last(items).width;
    return items.concat({
      left: lastRight,
      width: countForDimension.count,
      color: colorScale(countForDimension.dimension),
      key: countForDimension.dimension
    });
  }, []);
}