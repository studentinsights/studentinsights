import React from 'react';
import {Switch, Route} from 'react-router-dom';

import DashboardOverview from './dashboard_overview.jsx';
import SchoolwideAbsences from './absences_dashboard/schoolwide_absences.jsx';
import SchoolwideTardies from './tardies_dashboard/schoolwide_tardies.jsx';

export default React.createClass({
  displayName: 'SchoolAdministratorDashboards',

  propTypes: {
    serializedData: React.PropTypes.object.isRequired
  },

  render: function() {
    console.log(this.props.serializedData);
    return(
      <Switch>
        <Route exact path="/" render={ () => <DashboardOverview />} />
        <Route path="/absences_dashboard" render={ () => <SchoolwideAbsences dashboardStudents={this.props.serializedData.students}/>} />
        <Route path="/tardies_dashboard" render={ () => <SchoolwideTardies dashboardStudents={this.props.serializedData.students}/>} />
      </Switch>);
  }
});
