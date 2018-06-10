import React from 'react';
import PropTypes from 'prop-types';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import SchoolwideAbsences from './absences_dashboard/SchoolwideAbsences';
import SchoolwideTardies from './tardies_dashboard/SchoolwideTardies';
import SchoolwideDisciplineIncidents from './discipline_dashboard/SchoolwideDisciplineIncidents';


class DashboardLoader extends React.Component {
  constructor(props) {
    super(props);
    this.fetchDashboardStudents = this.fetchDashboardStudents.bind(this);
    this.renderDashboard = this.renderDashboard.bind(this);
  }

  fetchDashboardStudents() {
    const {dashboardTarget, schoolId} = this.props;
    const url = `/api/schools/${schoolId}/${dashboardTarget}/data`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <GenericLoader
        promiseFn={this.fetchDashboardStudents}
        render={this.renderDashboard} />
    );
  }

  renderDashboard(json) {
    switch(this.props.dashboardTarget) {
    case 'absences':
      return (<SchoolwideAbsences
        dashboardStudents = {json}/>);
    case 'tardies':
      return (<SchoolwideTardies
        dashboardStudents = {json}/>);
    case 'discipline':
      return (<SchoolwideDisciplineIncidents
        dashboardStudents = {json}/>);
    default:
      return <div style={{padding: 10}}>There was an error loading this data.</div>;
    }
  }
}

DashboardLoader.propTypes = {
  dashboardTarget: PropTypes.string.isRequired, //tells the loader which dashboard to load
  schoolId: PropTypes.string.isRequired
};

export default DashboardLoader;
