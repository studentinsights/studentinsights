import React from 'react';
import PropTypes from 'prop-types';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import SchoolwideTardies from './tardies_dashboard/SchoolwideTardies';
import SchoolwideDisciplineIncidents from './discipline_dashboard/SchoolwideDisciplineIncidents';
import {
  updateGlobalStylesToTakeFullHeight,
  updateGlobalStylesToRemoveHorizontalScrollbars
} from '../helpers/globalStylingWorkarounds';

class DashboardLoader extends React.Component {
  constructor(props) {
    super(props);
    this.fetchDashboardStudents = this.fetchDashboardStudents.bind(this);
    this.renderDashboard = this.renderDashboard.bind(this);
  }

  componentDidMount() {
    updateGlobalStylesToTakeFullHeight();
    updateGlobalStylesToRemoveHorizontalScrollbars();
  }

  fetchDashboardStudents() {
    const {dashboardTarget, schoolId} = this.props;
    const url = `/api/schools/${schoolId}/${dashboardTarget}/data`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <GenericLoader
        style={{flex: 1, display: 'flex'}}
        promiseFn={this.fetchDashboardStudents}
        render={this.renderDashboard} />
    );
  }

  renderDashboard(json) {
    switch(this.props.dashboardTarget) {
    case 'tardies':
      return (
        <SchoolwideTardies
          dashboardStudents={json.students_with_events}
          school={json.school} />
      );
    case 'discipline':
      return (
        <SchoolwideDisciplineIncidents
          dashboardStudents={json.students_with_events}
          school={json.school} />
      );
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
