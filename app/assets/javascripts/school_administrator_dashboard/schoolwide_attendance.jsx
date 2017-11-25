import React from 'react';

import DashboardHelpers from './dashboard_helpers.jsx';
import PageContainer from './page_container.jsx';

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
        <PageContainer
          schoolAverageDailyAttendance = {this.schoolAverageDailyAttendance()}
          dashboardStudents = {this.props.dashboardStudents}/>);
  }
});
