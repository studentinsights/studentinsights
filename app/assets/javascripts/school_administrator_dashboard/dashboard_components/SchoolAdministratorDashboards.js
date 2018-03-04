import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Route} from 'react-router-dom';

import DashboardOverview from './DashboardOverview';
import SchoolwideAbsences from './absences_dashboard/SchoolwideAbsences';
import SchoolwideTardies from './tardies_dashboard/SchoolwideTardies';
import SchoolWideDisciplineIncidents from './discipline_dashboard/SchoolWideDisciplineIncidents';

export default function SchoolAdministratorDashboards ( {serializedData} ) {
  const {students} = serializedData;
  return(
  <Switch>
    <Route exact path="/" render={ () => <DashboardOverview />} />
    <Route path="/absences_dashboard" render={ () => <SchoolwideAbsences dashboardStudents={students}/>} />
    <Route path="/tardies_dashboard" render={ () => <SchoolwideTardies dashboardStudents={students}/>} />
    <Route path="/discipline_dashboard" render={ () => <SchoolWideDisciplineIncidents dashboardStudents={students}/>} />
  </Switch>);
}

SchoolAdministratorDashboards.propTypes = {
  serializedData: PropTypes.object.isRequired
};
