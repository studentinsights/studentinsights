import React from 'react';
import PropTypes from 'prop-types';

import DashboardHelpers from '../DashboardHelpers';
import StudentsTable from '../StudentsTable';
import DashboardBarChart from '../DashboardBarChart';
import DateSlider from '../DateSlider';

class SchoolDisciplineDashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      startDate: DashboardHelpers.schoolYearStart(),
      selectedChart: {
        type: "location",
        data: this.props.disciplineIncidentsByLocation,
        title: "Incidents by Location"},
      selectedCategory: null
    };
    this.setDate = (range) => {
      this.setState({
        startDate: moment.unix(range[0]).format("YYYY-MM-DD")
      });
    };
    this.setStudentList = (highchartsEvent) => {
      this.setState({selectedCategory: highchartsEvent.point.category});
    };
    this.resetStudentList = () => {
      this.setState({selectedCategory: null});
    };
    this.selectChart = (event) => {
      this.setState({selectedChart: this.updateChartSelection(event.target.value), selectedCategory: null});
    };
  }

  filterIncidentDates(incidents) {
    return incidents.filter((incident) => {
      return moment(incident.occurred_at).isSameOrAfter(moment(this.state.startDate));
    });
  }

  studentDisciplineIncidentCounts(incidentCategory) {
    let studentDisciplineIncidentCounts = {};
    const incidents = incidentCategory ? this.state.selectedChart.data[incidentCategory] : this.props.totalDisciplineIncidents;
    this.filterIncidentDates(incidents).forEach((incident) => {
      studentDisciplineIncidentCounts[incident.student_id] = studentDisciplineIncidentCounts[incident.student_id] || 0;
      studentDisciplineIncidentCounts[incident.student_id]++;
    });
    return studentDisciplineIncidentCounts;
  }

  updateChartSelection(selectedChart) {
    switch(selectedChart) {
    case 'location':
      return {
        type: selectedChart,
        data: this.props.disciplineIncidentsByLocation,
        title: "Incidents by Location"};
    case 'time':
      return {
        type: selectedChart,
        data: this.props.disciplineIncidentsByTime,
        title: "Incidents by Time"};
    case 'classroom':
      return {
        type: selectedChart,
        data: this.props.disciplineIncidentsByClassroomn,
        title: "Incidents by Classroom"};
    case 'grade':
      return {
        type: selectedChart,
        data: this.props.disciplineIncidentsByGrade,
        title: "Incidents by Grade"};
    case 'day':
      return {
        type: selectedChart,
        data: this.props.disciplineIncidentsByDay,
        title: "Incidents by Day"};
    case 'offense':
      return {
        type: selectedChart,
        data: this.props.disciplineIncidentsByOffense,
        title: "Incidents by Offense"};
    case 'race':
      return {
        type: selectedChart,
        data: this.props.disciplineIncidentsByRace,
        title: "Incidents by Race"};
    }
  }

  render() {
    return(
      <div className="DashboardContainer">
        <div className="DashboardChartsColumn">
        <select value={this.state.selectedChart.type} onChange={this.selectChart}>
          <option value="location">Location</option>
          <option value="time">Time</option>
          <option value="classroom">Classroom</option>
          <option value="grade">Grade</option>
          <option value="day">Day</option>
          <option value="offense">Offense</option>
          </select>
         {this.renderDisciplineChart(this.state.selectedChart)}

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
    const incidentGroup = this.state.selectedChart.data;
    let categories = Object.keys(incidentGroup);
    categories.forEach((type) => {
      const incidents = this.filterIncidentDates(incidentGroup[type]);
      seriesData.push([type, incidents.length]);
    });

    return (
        <DashboardBarChart
          id = "Discipline"
          categories = {{categories: categories}}
          seriesData = {seriesData}
          titleText = {this.state.selectedChart.title}
          measureText = {this.state.selectedChart.title}
          tooltip = {{
            pointFormat: 'Total incidents: <b>{point.y}</b>'}}
          onColumnClick = {this.setStudentList}
          onBackgroundClick = {this.resetStudentList}/>
    );
  }

  renderDateRangeSlider() {
    const firstDate = DashboardHelpers.schoolYearStart();
    const lastDate = moment();
    return (
      <DateSlider
        rangeStart = {parseInt(moment(firstDate).format("X"))}
        rangeEnd = {parseInt(moment(lastDate).format("X"))}
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
  totalDisciplineIncidents: PropTypes.array.isRequired,
  disciplineIncidentsByLocation: PropTypes.object.isRequired,
  disciplineIncidentsByTime: PropTypes.object.isRequired,
  disciplineIncidentsByClassroomn: PropTypes.object.isRequired,
  disciplineIncidentsByGrade: PropTypes.object.isRequired,
  disciplineIncidentsByDay: PropTypes.object.isRequired,
  disciplineIncidentsByOffense: PropTypes.object.isRequired,
  disciplineIncidentsByRace: PropTypes.object.isRequired
};

export default SchoolDisciplineDashboard;
