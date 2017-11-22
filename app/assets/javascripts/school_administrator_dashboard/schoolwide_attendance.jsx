import React from 'react';

import DashboardHelpers from './dashboard_helpers.jsx';
import HomeroomAttendance from './homeroom_attendance.jsx';

export default React.createClass({
  displayName: 'SchoolwideAttendance',

  propTypes: {
    dashboardStudents: React.PropTypes.array.isRequired  //should rename more generically
  },

  schoolAverageDailyAttendance: function() {
    const studentRecords = this.props.dashboardStudents;
    return DashboardHelpers.averageDailyAttendance(DashboardHelpers.absenceEventsByDay(studentRecords), this.totalStudents());
  },

  totalStudents: function() {
    return this.props.dashboardStudents.length;
  },

  render: function() {
    return (
        <HomeroomAttendance
          schoolAverageDailyAttendance = {this.schoolAverageDailyAttendance()}
          dashboardStudents = {this.props.dashboardStudents}/>);
  }
});
