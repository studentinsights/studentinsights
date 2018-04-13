import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import DashboardHelpers from '../DashboardHelpers';
import StudentsTable from '../StudentsTable';
import DashboardBarChart from '../DashboardBarChart';
import DateSlider from '../DateSlider';

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
  selectChart(event) {
    this.setState({selectedChart: event.target.value, selectedCategory: null});
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
    return ['PK', 'KF', '1','2','3','4','5','6','7','8','9','10','11','12'];

  }

  render() {
    const selectedChart = this.getChartData(this.state.selectedChart);

    return(
      <div className="DashboardContainer">
        <div className="DashboardChartsColumn">
        <select value={selectedChart.type} onChange={this.selectChart}>
          <option value="location">Location</option>
          <option value="time">Time</option>
          <option value="classroom">Classroom</option>
          <option value="grade">Grade</option>
          <option value="day">Day</option>
          <option value="offense">Offense</option>
          </select>
         {this.renderDisciplineChart(selectedChart)}

        </div>
        <div className="DashboardRosterColumn">
          {this.renderDateRangeSlider()}
          {this.renderStudentDisciplineTable()}
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
          titleText = {selectedChart.title}
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
        last_sst_date_text: student.last_sst_date_text,
        events: studentDisciplineIncidentCounts[student.id] || 0
      });
    });

    return (
      <StudentsTable
        rows = {rows}
        selectedCategory = {this.state.selectedCategory}/>
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
