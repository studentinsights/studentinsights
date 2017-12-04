import React from 'react';

import DashboardHelpers from '../dashboard_helpers.jsx';
import SchoolwideAttendance from './schoolwide_attendance.jsx';

export default React.createClass({
  displayName: 'SchoolwideAbsences',

  propTypes: {
    dashboardStudents: React.PropTypes.array.isRequired  //should rename more generically
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
