import React from 'react';
import _ from 'lodash';

import SchoolAbsenceDashboard from './school_absence_dashboard.jsx';

export default React.createClass({
  displayName: 'DashboardPageContainer',

  propTypes: {
    dashboardStudents: React.PropTypes.array.isRequired  //should rename more generically
  },

  //Might be more efficient to have this passed as a prop before calculating homeroom attendance b/c it's called twice for schoolDays
  schoolAverageDailyAttendance: function() {
    const studentRecords = this.props.dashboardStudents;
    return this.averageDailyAttendance(this.absenceEventsByDay(studentRecords), this.totalStudents());
  },

  homeRoomAverageDailyAttendance: function() {
    const studentRecords = this.props.dashboardStudents;
    const studentsByHomeroom = this.groupByHomeroom(studentRecords);
    const eventsByHomeroom = this.homeroomAbsenceEventsByDay(studentsByHomeroom);
    let homeRoomAverageDailyAttendance = {};
    Object.keys(eventsByHomeroom).forEach((homeroom) => {
      const homeroomSize = studentsByHomeroom[homeroom].length;
      homeRoomAverageDailyAttendance[homeroom] = this.averageDailyAttendance(eventsByHomeroom[homeroom], homeroomSize);
    });
    return homeRoomAverageDailyAttendance;
  },

  homeroomAbsenceEventsByDay: function(studentsGroupedByHomeroom) {
    let homeroomAbsenceEventsByDay = {};
    Object.keys(studentsGroupedByHomeroom).forEach((homeroom) => {
      const daysWithAbsences = this.absenceEventsByDay(studentsGroupedByHomeroom[homeroom]);
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

  absenceEventsByDay: function(studentRecordsArray) {
    const absenceEvents = _.flattenDeep(studentRecordsArray.map((student) => {
      return student.absences;
    }));
    return this.eventsGroupedByDay(absenceEvents);
  },

  //There's no application awareness of valid school days, but there are almost never schoolwide perfect attendance days
  //We use days the school has recorded at least one absence as a proxy for school days
  schoolDays: function () {
    return Object.keys(this.schoolAverageDailyAttendance());
  },

  averageDailyAttendance: function(absenceEventsByDay, size) {
    let averageDailyAttendance = {};
    Object.keys(absenceEventsByDay).forEach((day) => {
      const rawAvg = (size - absenceEventsByDay[day].length)/size*100;
      averageDailyAttendance[day] = Math.round(rawAvg*10)/10;
    });
    return averageDailyAttendance;
  },

  //takes array of events and groups by day on which they occurred
  eventsGroupedByDay: function(events) {
    return _.groupBy(events, (event) => {
      return moment.utc(event.occurred_at).format("YYYY-MM-DD");
    });
  },

  totalStudents: function() {
    return this.props.dashboardStudents.length;
  },

  render: function() {
    const schoolAverageDailyAttendance = this.schoolAverageDailyAttendance();
    return (
        <SchoolAbsenceDashboard
          schoolAttendance = {schoolAverageDailyAttendance}
          homeRoomAttendance = {this.homeRoomAverageDailyAttendance()}
          students = {this.props.dashboardStudents}
          dateRange = {Object.keys(schoolAverageDailyAttendance).sort()}/>);
  }
});
