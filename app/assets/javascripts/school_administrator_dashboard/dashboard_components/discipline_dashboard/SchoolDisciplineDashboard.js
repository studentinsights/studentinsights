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
      startDate: '2012-08-10', //DashboardHelpers.schoolYearStart(),
      selectedType: null
    };
    this.setDate = (range) => {
      this.setState({
        startDate: moment.unix(range[0]).format("YYYY-MM-DD")
      });
    };
    this.setStudentList = (highchartsEvent) => {
      this.setState({selectedType: highchartsEvent.point.category});
    };
    this.resetStudentList = () => {
      this.setState({selectedType: null});
    };
  }

  filterIncidentDates(incidents) {
    return incidents.filter((incident) => {
      return moment(incident.occurred_at).isSameOrAfter(moment(this.state.startDate));
    });
  }

  render() {
    return(this.renderDisciplineChart(this.props.disciplineIncidentsByLocation));
  }

  renderDisciplineChart(group) { //turn this into independant function
    let seriesData = [];
    let categories = Object.keys(group);
    categories.forEach((type) => {
      const incidents = this.filterIncidentDates(group[type]);
      seriesData.push([type, incidents.length]);
    });

    return (
        <DashboardBarChart
          id = {'string'}
          categories = {{categories: categories}}
          seriesData = {seriesData}
          titleText = {group}
          measureText = {'Number of Incidents'}
          tooltip = {{
            pointFormat: 'Total incidents: <b>{point.y}</b>'}}
          onColumnClick = {this.resetStudentList}
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
}

SchoolDisciplineDashboard.propTypes = {
  disciplineIncidentsByLocation: PropTypes.object.isRequired,
  disciplineIncidentsByTime: PropTypes.object.isRequired,
  disciplineIncidentsByClassroomn: PropTypes.object.isRequired,
  disciplineIncidentsByGrade: PropTypes.object.isRequired,
  disciplineIncidentsByDay: PropTypes.object.isRequired,
  disciplineIncidentsByOffense: PropTypes.object.isRequired,
  disciplineIncidentsByRace: PropTypes.object.isRequired
};

export default SchoolDisciplineDashboard;
