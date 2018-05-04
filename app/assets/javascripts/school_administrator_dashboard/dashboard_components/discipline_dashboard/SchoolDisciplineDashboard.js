import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

import DashboardHelpers from '../DashboardHelpers';
import StudentsTable from '../StudentsTable';
import DashboardBarChart from '../DashboardBarChart';
import DateSlider from '../DateSlider';
import {latestNoteDateText} from '../../../helpers/latestNoteDateText';
import {sortByGrade} from '../../../helpers/SortHelpers';

class SchoolDisciplineDashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      startDate: DashboardHelpers.schoolYearStart(),
      selectedChart: 'location',
      selectedCategory: null
    };
    this.setDate = this.setDate.bind(this);
    this.setStudentList = this.setStudentList.bind(this);
    this.resetStudentList = this.resetStudentList.bind(this);
    this.selectChart = this.selectChart.bind(this);
  }

  setDate(range) {
    this.setState({
      startDate: moment.unix(range[0]).format("YYYY-MM-DD")
    });
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

  filterIncidentDates(incidents) {
    return incidents.filter((incident) => {
      return moment.utc(incident.occurred_at).isSameOrAfter(moment.utc(this.state.startDate));
    });
  }

  studentDisciplineIncidentCounts(incidentCategory) {
    let studentDisciplineIncidentCounts = {};
    const selectedChartData = this.getChartData(this.state.selectedChart);
    const incidents = incidentCategory ? selectedChartData.disciplineIncidents[incidentCategory] : this.props.schoolDisciplineEvents;
    this.filterIncidentDates(incidents).forEach((incident) => {
      studentDisciplineIncidentCounts[incident.student_id] = studentDisciplineIncidentCounts[incident.student_id] || 0;
      studentDisciplineIncidentCounts[incident.student_id]++;
    });
    return studentDisciplineIncidentCounts;
  }

  getChartData(selectedChart) {
    return {
      type: selectedChart,
      disciplineIncidents: _.groupBy(this.props.schoolDisciplineEvents, selectedChart),
      title: "Incidents by " + selectedChart};
  }

  sortChartKeys(chartKeys) {
    switch(this.state.selectedChart) {
    case 'time': return this.sortedTimes(chartKeys);
    case 'day': return this.sortedDays(chartKeys);
    case 'grade': return this.sortedGrades(chartKeys);
    case 'classroom': return this.sortedClassrooms(chartKeys);
    default: return chartKeys;
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

  sortedClassrooms(chartKeys) {
    if(this.state.selectedChart == 'classroom') { //should always be true when this method is called
      const chart = this.getChartData(this.state.selectedChart);
      return chartKeys.sort((a,b) => {
          return chart.disciplineIncidents[a] - chart.disciplineIncidents[b];
      });
    } else return chartKeys.sort(); //if for some reason called without classroom selection
  }

  render() {
    const selectedChart = this.getChartData(this.state.selectedChart);
    const chartOptions = [
      {value: 'location', label: 'Location'},
      {value: 'time', label: 'Time'},
      {value: 'classroom', label: 'Classroom'},
      {value: 'grade', label: 'Grade'},
      {value: 'day', label: 'Day'},
      {value: 'offense', label: 'Offense'},
    ];

    return(
      <div className="DashboardContainer">
        <div className="DashboardRosterColumn">
          {this.renderDateRangeSlider()}
          {this.renderStudentDisciplineTable()}
        </div>
        <div className="DashboardChartsColumn">
          <div style={styles.graphTitle}>
            <div style={styles.titleText}>
              Incidents by:
            </div>
            <Select
              value={this.state.selectedChart}
              onChange={this.selectChart}
              options={chartOptions}
              style={styles.dropdown}
            />
          </div>
         {this.renderDisciplineChart(selectedChart)}
        </div>
      </div>
    );
  }

  renderDisciplineChart(selectedChart) {
    const categories = this.sortChartKeys(Object.keys(selectedChart.disciplineIncidents));
    const seriesData = categories.map((type) => {
      if (!selectedChart.disciplineIncidents[type]) return [];
      const incidents = this.filterIncidentDates(selectedChart.disciplineIncidents[type]);
      return [type, incidents.length];
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

  renderDateRangeSlider() {
    const firstDate = DashboardHelpers.schoolYearStart();
    const lastDate = moment.utc();
    return (
      <DateSlider
        rangeStart = {parseInt(moment.utc(firstDate).format("X"))}
        rangeEnd = {parseInt(moment.utc(lastDate).format("X"))}
        setDate={this.setDate}/>
    );
  }

  renderStudentDisciplineTable() {
    const students = this.props.dashboardStudents;
    const studentDisciplineIncidentCounts = this.studentDisciplineIncidentCounts(this.state.selectedCategory);
    let rows =[];
    students.forEach((student) => {
      rows.push({
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        last_sst_date_text: latestNoteDateText(300, student.sst_notes),
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
  })).isRequired
};

export default SchoolDisciplineDashboard;

const styles = {
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
