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
    const selectedChart = this.getChartData(this.state.selectedChart);
    const incidents = incidentCategory ? selectedChart.data[incidentCategory] : this.props.totalDisciplineIncidents;
    this.filterIncidentDates(incidents).forEach((incident) => {
      studentDisciplineIncidentCounts[incident.student_id] = studentDisciplineIncidentCounts[incident.student_id] || 0;
      studentDisciplineIncidentCounts[incident.student_id]++;
    });
    return studentDisciplineIncidentCounts;
  }

  getChartData(selectedChart) {
    return {
      type: selectedChart,
      data: _.groupBy(this.props.totalDisciplineIncidents, selectedChart),
      title: "Incidents by " + selectedChart};
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

  renderDisciplineChart(group) {
    let seriesData = [];
    const selectedChart = this.getChartData(this.state.selectedChart);
    const categories = Object.keys(selectedChart.data);
    categories.forEach((type) => {
      const incidents = this.filterIncidentDates(selectedChart.data[type]);
      seriesData.push([type, incidents.length]);
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
  totalDisciplineIncidents: PropTypes.array.isRequired
};

export default SchoolDisciplineDashboard;
