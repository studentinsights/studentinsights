import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import SelectTimeRange, {
  momentRange,
  timeRangeText,
  TIME_RANGE_45_DAYS_AGO
} from '../../components/SelectTimeRange';
import SectionHeading from '../../components/SectionHeading';
import EscapeListener from '../../components/EscapeListener';
import FilterBar from '../../components/FilterBar';
import DashboardHelpers from '../DashboardHelpers';
import StudentsTable from '../StudentsTable';
import DashboardBarChart from '../DashboardBarChart';
import * as dashboardStyles from '../dashboardStyles';


export default class SchoolTardiesDashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = initialState();

    this.onTimeRangeKeyChanged = this.onTimeRangeKeyChanged.bind(this);
    this.onResetFilters = this.onResetFilters.bind(this);
    this.setStudentList = (highchartsEvent) => {
      this.setState({selectedHomeroom: highchartsEvent.point.category});
    };
    this.resetStudentList = () => {
      this.setState({selectedHomeroom: null});
    };
  }

  startDate() {
    const {nowFn} = this.context;
    const {timeRangeKey} = this.state;
    const range = momentRange(timeRangeKey, nowFn());
    return range[0];
  }

  timeRangeText() {
    const {timeRangeKey} = this.state;
    return timeRangeText(timeRangeKey);
  }

  createMonthCategories(seriesData) {
    let monthCategories = {};
    let lastStoredMonth;

    seriesData.forEach((day, dayIndex) => {
      const month = moment(day[0], "ddd MM/DD/YYYY");

      if (lastStoredMonth != month.date(1).format("MMM 'YY")) {
        lastStoredMonth = month.date(1).format("MMM 'YY");
        monthCategories[dayIndex] = lastStoredMonth;
      }
    });
    return monthCategories;
  }

  getDatesSince(date) {
    const today = moment.utc().format('YYYY-MM-DD');
    let result = [];
    while (moment.utc(date).isBefore(moment.utc(today))) {
      result.push(date);
      date = moment.utc(date).add(1, 'day').format('YYYY-MM-DD');
    }
    return result;
  }

  studentTardyCounts(tardiesArray) {
    let studentTardyCounts = {};
    const daysWithTardies = Object.keys(this.props.schoolTardyEvents);
    const today = moment.utc().format("YYYY-MM-DD");
    const schoolYearTardies = DashboardHelpers.filterDates(daysWithTardies.sort(), this.startDate(), today);

    schoolYearTardies.forEach((day) => {
      _.each(this.props.schoolTardyEvents[day], (tardy) => {
        studentTardyCounts[tardy.student_id] = studentTardyCounts[tardy.student_id] || 0;
        studentTardyCounts[tardy.student_id]++;
      });
    });
    return studentTardyCounts;
  }

  homeroomTardyEventsSince() {
    let homeroomTardyEvents = {};
    const studentRecords = this.props.dashboardStudents;
    const studentsByHomeroom = DashboardHelpers.groupByHomeroom(studentRecords);
    Object.keys(studentsByHomeroom).forEach((homeroom) => {
      homeroomTardyEvents[homeroom] = 0;
      _.each(studentsByHomeroom[homeroom], (student) => {
        student.tardies.forEach((tardy) => {
          if (moment.utc(tardy.occurred_at).isSameOrAfter(this.startDate())) {
            homeroomTardyEvents[homeroom]++;
          }
        });
      });
    });
    return homeroomTardyEvents;
  }

  onTimeRangeKeyChanged(timeRangeKey) {
    this.setState({timeRangeKey});
  }

  onResetFilters() {
    this.setState(initialState());
  }

  render() {
    const {timeRangeKey} = this.state;
    const {school} = this.props;
    return (
      <EscapeListener className="SchoolTardiesDashboard" style={styles.root} onEscape={this.onResetFilters}>
        <SectionHeading>Tardies at {school.name}</SectionHeading>
        <div style={dashboardStyles.filterBar}>
          <FilterBar labelText="Time range" style={styles.timeRange}>
            <SelectTimeRange
              timeRangeKey={timeRangeKey}
              onChange={this.onTimeRangeKeyChanged} />
          </FilterBar>
        </div>
        <div style={dashboardStyles.columns}>
          <div style={dashboardStyles.rosterColumn}>
            {this.renderStudentTardiesTable()}
          </div>
          <div style={dashboardStyles.chartsColumn}>
            {this.renderMonthlyTardiesChart()}
            {this.renderHomeroomTardiesChart()}
          </div>
        </div>
      </EscapeListener>
    );
  }

  renderMonthlyTardiesChart() {
    const seriesData = this.getDatesSince(this.startDate()).map((date) => {
      const day = moment.utc(date).format("ddd MM/DD/YYYY");
      const tardies = this.props.schoolTardyEvents[date] ? this.props.schoolTardyEvents[date].length : 0;
      return [day, tardies];
    });
    const monthCategories = this.createMonthCategories(seriesData);
    let tickPositions = Object.keys(monthCategories).map(Number);
    tickPositions.splice(0, 1);

    return (
      <DashboardBarChart
        id={'string'}
        animation={false}
        categories={{
          offset: 0,
          linkedTo: 0,
          categories: monthCategories,
          tickPositions: tickPositions,
          tickmarkPlacement: "on"
        }}
        seriesData={seriesData}
        titleText={`Schoolwide Tardies (${this.timeRangeText()})`}
        measureText={'Number of Tardies'}
        tooltip={{
          pointFormat: 'Total tardies: <b>{point.y}</b>'}}
        onColumnClick={this.resetStudentList}
        onBackgroundClick={this.resetStudentList}/>
    );
  }

  renderHomeroomTardiesChart() {
    const homeroomTardyEvents = this.homeroomTardyEventsSince(this.startDate());
    const homerooms = Object.keys(homeroomTardyEvents).sort((a,b) => {
      return homeroomTardyEvents[b] - homeroomTardyEvents[a];
    });
    const homeroomSeries = homerooms.map((homeroom) => {
      const color = (homeroom === this.state.selectedHomeroom)? 'orange' : null;
      const y = homeroomTardyEvents[homeroom];
      return {y, color};
    });

    return (
        <DashboardBarChart
          id={'string'}
          animation={false}
          categories={{categories: homerooms}}
          seriesData={homeroomSeries}
          titleText={`Tardies by Homeroom (${this.timeRangeText()})`}
          measureText={'Number of Tardies'}
          tooltip= {{
            pointFormat: 'Total tardies: <b>{point.y}</b>'}}
          onColumnClick={this.setStudentList}
          onBackgroundClick={this.resetStudentList}/>
    );
  }

  renderStudentTardiesTable() {
    const studentTardyCounts = this.studentTardyCounts();
    const studentsByHomeroom = DashboardHelpers.groupByHomeroom(this.props.dashboardStudents);
    const students = studentsByHomeroom[this.state.selectedHomeroom] || this.props.dashboardStudents;
    let rows =[];
    students.forEach((student) => {
      rows.push({
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        latest_note: student.latest_note,
        events: studentTardyCounts[student.id] || 0,
        grade: student.grade
      });
    });

    return (
      <StudentsTable
        rows={rows}
        incidentType='Tardies'
        incidentSubtitle={this.timeRangeText()}/>
    );
  }
}
SchoolTardiesDashboard.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
SchoolTardiesDashboard.propTypes = {
  schoolTardyEvents: PropTypes.object.isRequired,
  dashboardStudents: PropTypes.array.isRequired,
  school: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired
};

const styles = {
  root: {
    flex: 1,
    width: '100%',
    marginLeft: 10,
    marginRight: 10,
    display: 'flex',
    flexDirection: 'column'
  },
  timeRange: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end'
  }
};

function initialState() {
  return {
    timeRangeKey: TIME_RANGE_45_DAYS_AGO,
    selectedHomeroom: null
  };
}
