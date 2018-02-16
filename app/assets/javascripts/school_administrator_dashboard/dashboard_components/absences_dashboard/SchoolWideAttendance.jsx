import React from 'react';

import DashboardHelpers from '../DashboardHelpers.js';
import SchoolAbsenceDashboard from './SchoolAbsenceDashboard.jsx';

export default React.createClass({
  displayName: 'SchoolwideAttendance',

  propTypes: {
    schoolAbsenceEvents: React.PropTypes.object.isRequired,
    dashboardStudents: React.PropTypes.array.isRequired
  },

  schoolAverageDailyAttendance: function() {
    return DashboardHelpers.averageDailyAttendance(this.props.schoolAbsenceEvents, this.props.dashboardStudents.length);
  },

  homeroomAverageDailyAttendance: function() {
    const studentRecords = this.props.dashboardStudents;
    const studentsByHomeroom = DashboardHelpers.groupByHomeroom(studentRecords);
    const eventsByHomeroom = this.homeroomAbsenceEventsByDay(studentsByHomeroom);
    let homeroomAverageDailyAttendance = {};
    Object.keys(eventsByHomeroom).forEach((homeroom) => {
      const homeroomSize = studentsByHomeroom[homeroom].length;
      homeroomAverageDailyAttendance[homeroom] = DashboardHelpers.averageDailyAttendance(eventsByHomeroom[homeroom], homeroomSize);
    });
    return homeroomAverageDailyAttendance;
  },

  homeroomAbsenceEventsByDay: function(studentsGroupedByHomeroom) {
    let homeroomAbsenceEventsByDay = {};
    Object.keys(studentsGroupedByHomeroom).forEach((homeroom) => {
      const daysWithAbsences = DashboardHelpers.absenceEventsByDay(studentsGroupedByHomeroom[homeroom]);
      homeroomAbsenceEventsByDay[homeroom] = this.addPerfectAttendanceDays(daysWithAbsences);
    });
    return homeroomAbsenceEventsByDay;
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
    return Object.keys(this.props.schoolAbsenceEvents);
  },

  render: function() {
    return (
        <SchoolAbsenceDashboard
          schoolAverageDailyAttendance = {this.schoolAverageDailyAttendance()}
          homeroomAverageDailyAttendance = {this.homeroomAverageDailyAttendance()}
          schoolAbsenceEvents = {this.props.schoolAbsenceEvents}
          dashboardStudents = {this.props.dashboardStudents}
          dateRange = {Object.keys(this.schoolAverageDailyAttendance()).sort()}/>);
  }
});
