import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Route} from 'react-router-dom';
import MountTimer from '../../components/MountTimer';
import DashboardOverview from './DashboardOverview';
import SchoolwideAbsences from './absences_dashboard/SchoolwideAbsences';
import SchoolwideTardies from './tardies_dashboard/SchoolwideTardies';
import SchoolWideDisciplineIncidents from './discipline_dashboard/SchoolWideDisciplineIncidents';

class SchoolAdministratorDashboards extends React.Component {
  render() {
    const {students} = this.props.serializedData;
    return (
      <MountTimer>
        <Switch>
          <Route exact path="/" render={ () => <DashboardOverview />} />
          <Route path="/absences_dashboard" render={ () => <SchoolwideAbsences dashboardStudents={students}/>} />
          <Route path="/tardies_dashboard" render={ () => <SchoolwideTardies dashboardStudents={students}/>} />
          <Route path="/discipline_dashboard" render={ () => <SchoolWideDisciplineIncidents dashboardStudents={students}/>} />
        </Switch>
      </MountTimer>
    );
  }
}

SchoolAdministratorDashboards.propTypes = {
  serializedData: PropTypes.object.isRequired
};

export default SchoolAdministratorDashboards;
