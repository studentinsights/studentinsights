import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import SelectTimeRange, {
  momentRange,
  TIME_RANGE_45_DAYS_AGO
} from '../../components/SelectTimeRange';
import FilterBar from '../../components/FilterBar';
import {sortByGrade} from '../../helpers/SortHelpers';
import ExperimentalBanner from '../../components/ExperimentalBanner';
import SectionHeading from '../../components/SectionHeading';
import EscapeListener from '../../components/EscapeListener';
import StudentsTable from '../StudentsTable';
import DashboardBarChart from '../DashboardBarChart';


export default class SchoolDisciplineDashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = initialState();

    this.onTimeRangeKeyChanged = this.onTimeRangeKeyChanged.bind(this);
    this.onResetFilters = this.onResetFilters.bind(this);
    this.setStudentList = this.setStudentList.bind(this);
    this.resetStudentList = this.resetStudentList.bind(this);
    this.selectChart = this.selectChart.bind(this);
  }

  setStudentList(highchartsEvent) {
    this.setState({selectedCategory: highchartsEvent.point.category});
  }
  resetStudentList() {
    this.setState({selectedCategory: null});
  }
  selectChart(selection) {
    this.setState({selectedChart: selection.value, selectedCategory: null});
  }

  filterIncidentDates(incidentsArray) {
    const {nowFn} = this.context;
    const {timeRangeKey} = this.state;
    const range = momentRange(timeRangeKey, nowFn());
    return incidentsArray.filter((incident) => {
      return moment.utc(incident.occurred_at).isBetween(range[0], range[1]);
    });
  }

  studentDisciplineIncidentCounts(incidents) {
    let studentDisciplineIncidentCounts = {};

    //if a user selects a category and then moves to a time range with no incidents within that category, return an empty object
    if (!incidents) return studentDisciplineIncidentCounts;
    incidents.forEach((incident) => {
      studentDisciplineIncidentCounts[incident.student_id] = studentDisciplineIncidentCounts[incident.student_id] || 0;
      studentDisciplineIncidentCounts[incident.student_id]++;
    });
    return studentDisciplineIncidentCounts;
  }

  sortChartKeys(groupedIncidents) {
    const chartKeys = Object.keys(groupedIncidents);
    switch(this.state.selectedChart) {
    case 'time': return this.sortedTimes(chartKeys);
    case 'day': return this.sortedDays(chartKeys);
    case 'grade': return this.sortedGrades(chartKeys);
    default: return this.sortedByIncidents(groupedIncidents); //because number of incidents in each category needed here
    }
  }

  sortedDays(chartKeys) {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }

  sortedTimes(chartKeys) {
    //chartKeys will either contain a time like "4:00 pm", "10:00 am", or "Not Logged"
    return chartKeys.sort((a, b) => {
      if (a == "Not Logged") return -1;
      if (b == "Not Logged") return 1;
      return new Date('1970/01/01 ' + a) - new Date('1970/01/01 ' + b);
    });
  }

  sortedGrades(chartKeys) {
    return chartKeys.sort((a,b) => sortByGrade(a,b));
  }

  sortedByIncidents(groupedIncidents) {
    const chartKeys = Object.keys(groupedIncidents);
    return chartKeys.sort((a,b) => {
      return groupedIncidents[b].length - groupedIncidents[a].length;
    });
  }

  //For grades and classrooms, the students table should only show the relevant students
  groupStudents() {
    if (this.state.selectedChart === 'grade' && this.state.selectedCategory) {
      return this.props.dashboardStudents.filter(student => student.grade === this.state.selectedCategory);
    } else if (this.state.selectedChart === 'classroom' && this.state.selectedCategory) {
      return this.props.dashboardStudents.filter(student => student.homeroom_label === this.state.selectedCategory);
    } else return this.props.dashboardStudents;
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
    const chartOptions = [
      {value: 'location', label: 'Location'},
      {value: 'time', label: 'Time'},
      {value: 'classroom', label: 'Classroom'},
      {value: 'grade', label: 'Grade'},
      {value: 'day', label: 'Day'},
      {value: 'offense', label: 'Offense'},
    ];
    const filteredIncidents = this.filterIncidentDates(this.props.schoolDisciplineEvents);
    const groupedIncidents = _.groupBy(filteredIncidents, this.state.selectedChart);

    return(
      <EscapeListener className="SchoolDisciplineDashboard" style={styles.flexVertical} onEscape={this.onResetFilters}>
        <ExperimentalBanner />
        <div style={{...styles.flexVertical, paddingLeft: 10, paddingRight: 10}}>
          <SectionHeading>Discipline incidents at {school.name}</SectionHeading>
          <div className="SchoolDashboard-filter-bar">
            <FilterBar labelText="Time range" style={styles.timeRange} >
              <SelectTimeRange
                timeRangeKey={timeRangeKey}
                onChange={this.onTimeRangeKeyChanged} />
            </FilterBar>
          </div>
          <div className="SchoolDashboard-columns">
            <div className="SchoolDashboard-roster-column">
              {this.renderStudentDisciplineTable(filteredIncidents, groupedIncidents)}
            </div>
            <div className="SchoolDashboard-charts-column">
              <div style={styles.graphTitle}>
                <div style={styles.titleText}>
                  Break down by:
                </div>
                <Select
                  value={this.state.selectedChart}
                  onChange={this.selectChart}
                  options={chartOptions}
                  style={styles.dropdown}
                  clearable={false}
                />
              </div>
             {this.renderDisciplineChart(groupedIncidents)}
            </div>
          </div>
        </div>
      </EscapeListener>
    );
  }

  renderDisciplineChart(incidents) {
    const categories = this.sortChartKeys(incidents);
    const seriesData = categories.map((type) => {
      if (!incidents[type]) return [];
      return [type, incidents[type].length];
    });

    return (
        <DashboardBarChart
          id = "Discipline"
          categories = {{categories: categories}}
          seriesData = {seriesData}
          titleText = {null}
          measureText = {'Number of Incidents'}
          tooltip = {{
            pointFormat: 'Total incidents: <b>{point.y}</b>'}}
          onColumnClick = {this.setStudentList}
          onBackgroundClick = {this.resetStudentList}/>
    );
  }

  renderStudentDisciplineTable(allIncidents, groupedIncidents) {
    const students = this.groupStudents();
    const studentDisciplineIncidentCounts = this.state.selectedCategory ? //if the user is looking at a subgroup of incidents
                                            this.studentDisciplineIncidentCounts(groupedIncidents[this.state.selectedCategory]) :
                                            this.studentDisciplineIncidentCounts(allIncidents);
    let rows =[];
    students.forEach((student) => {
      rows.push({
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        latest_note: student.latest_note,
        events: studentDisciplineIncidentCounts[student.id] || 0,
        grade: student.grade
      });
    });

    return (
      <StudentsTable
        rows = {rows}
        selectedCategory = {this.state.selectedCategory}
        incidentType={"Incidents"}
        resetFn={this.resetStudentList}/>
    );
  }
}
SchoolDisciplineDashboard.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
SchoolDisciplineDashboard.propTypes = {
  dashboardStudents: PropTypes.array.isRequired,
  schoolDisciplineEvents: PropTypes.arrayOf(PropTypes.shape({
    student_id: PropTypes.number.isRequired, //ID of student involved in incident
    location: PropTypes.string, //Place where incident occurred
    time: PropTypes.string, //Time of day for incident - NULL if no specific time recorded
    classroom: PropTypes.string, //Name of student's homeroom teacher
    student_grade: PropTypes.string, //Grade of student
    day: PropTypes.string, //Day of week on which incident occurred
    offense: PropTypes.string, //Specific type of incident
    student_race: PropTypes.string, //Race of student
    occurred_at: PropTypes.string, //Date for incident, used in filtering specific date ranges
    last_sst_date_text: PropTypes.string //Date of last SST meeting
  })).isRequired,
  school: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired
};

const styles = {
  flexVertical: {
    flex: 1,
    width: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  timeRange: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  graphTitle: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px'
  },
  titleText: {
    fontSize: '18px',
    marginRight: '10px',
    alignSelf: 'center'
  },
  dropdown: {
    width: '200px'
  }
};

function initialState() {
  return {
    timeRangeKey: TIME_RANGE_45_DAYS_AGO,
    selectedChart: 'location',
    selectedCategory: null
  };
}
