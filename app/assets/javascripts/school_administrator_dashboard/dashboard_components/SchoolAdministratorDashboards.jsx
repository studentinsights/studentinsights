import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Route} from 'react-router-dom';

import DashboardOverview from './dashboard_overview.jsx';
import SchoolwideAbsences from './absences_dashboard/schoolwide_absences.jsx';
import SchoolwideTardies from './tardies_dashboard/schoolwide_tardies.jsx';

export default function SchoolAdministratorDashboards ( {serializedData} ) {
  const {students} = serializedData;
  return(
  <Switch>
    <Route exact path="/" render={ () => <DashboardOverview />} />
    <Route path="/absences_dashboard" render={ () => <SchoolwideAbsences dashboardStudents={students}/>} />
    <Route path="/tardies_dashboard" render={ () => <SchoolwideTardies dashboardStudents={students}/>} />
  </Switch>);
}

SchoolAdministratorDashboards.propTypes = {
  serializedData: PropTypes.object.isRequired
};
