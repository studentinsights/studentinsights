import React from 'react';
import _ from 'lodash';

import DashboardHelpers from './dashboard_helpers.jsx';
import SchoolAbsenceDashboard from './school_absence_dashboard.jsx';

export default React.createClass({
  displayName: 'DashboardPageContainer',

  propTypes: {
    schoolAverageDailyAttendance: React.PropTypes.object.isRequired,
    dashboardStudents: React.PropTypes.array.isRequired  //should rename more generically
  },

  homeRoomAverageDailyAttendance: function() {
    const studentRecords = this.props.dashboardStudents;
    const studentsByHomeroom = this.groupByHomeroom(studentRecords);
    const eventsByHomeroom = this.homeroomAbsenceEventsByDay(studentsByHomeroom);
    let homeRoomAverageDailyAttendance = {};
    Object.keys(eventsByHomeroom).forEach((homeroom) => {
      const homeroomSize = studentsByHomeroom[homeroom].length;
      homeRoomAverageDailyAttendance[homeroom] = DashboardHelpers.averageDailyAttendance(eventsByHomeroom[homeroom], homeroomSize);
    });
    return homeRoomAverageDailyAttendance;
  },

  homeroomAbsenceEventsByDay: function(studentsGroupedByHomeroom) {
    let homeroomAbsenceEventsByDay = {};
    Object.keys(studentsGroupedByHomeroom).forEach((homeroom) => {
      const daysWithAbsences = DashboardHelpers.absenceEventsByDay(studentsGroupedByHomeroom[homeroom]);
      homeroomAbsenceEventsByDay[homeroom] = this.addPerfectAttendanceDays(daysWithAbsences);
    });
    return homeroomAbsenceEventsByDay;
  },

  groupByHomeroom: function(studentRecords) {
    const studentsByHomeroom = _.groupBy(studentRecords, 'homeroom');
    if (studentsByHomeroom[null]) {
      studentsByHomeroom["No Homeroom"] = studentsByHomeroom[null];
      delete studentsByHomeroom[null];
    }
    return studentsByHomeroom;
  },

  //Because homerooms often have no absences, merge their daily events with the list of school days
  addPerfectAttendanceDays: function(eventsGroupedByDay) {
    this.schoolDays().forEach((day) => {
      if (!eventsGroupedByDay[day]) eventsGroupedByDay[day] = [];
    });
    return eventsGroupedByDay;
  },

  //There's no application awareness of valid school days, but there are almost never schoolwide perfect attendance days
  //We use days the school has recorded at least one absence as a proxy for school days
  schoolDays: function () {
    return Object.keys(this.props.schoolAverageDailyAttendance);
  },

  render: function() {
    return (
        <SchoolAbsenceDashboard
          schoolAttendance = {this.props.schoolAverageDailyAttendance}
          homeRoomAttendance = {this.homeRoomAverageDailyAttendance()}
          students = {this.props.dashboardStudents}
          dateRange = {Object.keys(this.props.schoolAverageDailyAttendance).sort()}/>);
  }
});
