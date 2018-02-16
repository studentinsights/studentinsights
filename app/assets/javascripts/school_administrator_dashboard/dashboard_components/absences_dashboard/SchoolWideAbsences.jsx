
import React from 'react';

import DashboardHelpers from '../DashboardHelpers.js';
import SchoolwideAttendance from './SchoolwideAttendance.jsx';

export default React.createClass({
  displayName: 'SchoolwideAbsences',

  propTypes: {
    dashboardStudents: React.PropTypes.array.isRequired
  },

  schoolAbsenceEvents: function() {
    const studentRecords = this.props.dashboardStudents;
    return DashboardHelpers.absenceEventsByDay(studentRecords);
  },

  render: function() {
    return (
        <SchoolwideAttendance
          schoolAbsenceEvents = {this.schoolAbsenceEvents()}
          dashboardStudents = {this.props.dashboardStudents}/>);
  }
});
