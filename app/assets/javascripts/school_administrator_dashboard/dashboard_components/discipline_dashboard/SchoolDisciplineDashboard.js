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
      selectedType: null,
      selectedCategory: null
    };
    this.setDate = (range) => {
      this.setState({
        startDate: moment.unix(range[0]).format("YYYY-MM-DD")
      });
    };
    this.setStudentList = (highchartsEvent) => {
      console.log(highchartsEvent);
      this.setState({selectedType: highchartsEvent.point.id, selectedCategory: highchartsEvent.point.category});
    };
    this.resetStudentList = () => {
      this.setState({selectedCategory: null});
    };
  }

  filterIncidentDates(incidents) {
    return incidents.filter((incident) => {
      return moment(incident.occurred_at).isSameOrAfter(moment(this.state.startDate));
    });
  }

  studentDisciplineIncidentCounts(incidentType, incidentCategory) {
    let studentDisciplineIncidentCounts = {};
    const incidents = incidentCategory ? this.filterIncidentDates(incidentType[incidentCategory]) : this.props.totalDisciplineIncidents;
    incidents.forEach((incident) => {
      studentDisciplineIncidentCounts[incident.student_id] = studentDisciplineIncidentCounts[incident.student_id] || 0;
      studentDisciplineIncidentCounts[incident.student_id]++;
    })
    return studentDisciplineIncidentCounts;
  }

  render() {
    return(
      <div className="DashboardContainer">
        <div className="DashboardChartsColumn">
         {this.renderDisciplineChart("disciplineIncidentsByLocation", "Incidents by Location")}
        </div>
        <div className="DashboardRosterColumn">
          {this.renderDateRangeSlider()}
          {this.renderStudentDisciplineTable()}
        </div>
      </div>
    );
  }

  renderDisciplineChart(group, title) { //turn this into independant function
    let seriesData = [];
    const incidentGroup = this.props[group];
    let categories = Object.keys(incidentGroup);
    categories.forEach((type) => {
      const incidents = this.filterIncidentDates(incidentGroup[type]);
      seriesData.push([type, incidents.length]);
    });

    console.log(this.props);
    console.log(this.state.selectedCategory);

    return (
        <DashboardBarChart
          id = {group}
          categories = {{categories: categories}}
          seriesData = {seriesData}
          titleText = {title}
          measureText = {'Number of Incidents'}
          tooltip = {{
            pointFormat: 'Total incidents: <b>{point.y}</b>'}}
          onColumnClick = {this.setStudentList}
          onBackgroundClick = {this.resetStudentList}/>
    );
  }

  renderDateRangeSlider() { //maybe its own function too
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
    //Here's how to do this:
    //Send specific, identifiable id for each incident chart
    //callback returns both that id and the selected category
    //id is used to pick the grouping (type) from props (possibly as new state)
    //category is used to select the subgroup (category) with that Type
    //
    console.log(this.state);
    const students = this.props.dashboardStudents;
    const type = this.state.selectedType || null;
    const category = this.state.selectedCategory || null;
    const studentDisciplineIncidentCounts = this.studentDisciplineIncidentCounts(this.state.selectedType, this.state.selectedCategory);
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
        selectedCategory = {this.state.selectedType}/>
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
