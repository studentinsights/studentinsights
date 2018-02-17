import React from 'react';
import PropTypes from 'prop-types';

import DashboardHelpers from '../DashboardHelpers.js';
import SchoolAbsenceDashboard from './SchoolAbsenceDashboard.jsx';

class SchoolwideAttendance extends React.Component {

  schoolAverageDailyAttendance() {
    return DashboardHelpers.averageDailyAttendance(this.props.schoolAbsenceEvents, this.props.dashboardStudents.length);
  }

  homeroomAverageDailyAttendance() {
    const studentRecords = this.props.dashboardStudents;
    const studentsByHomeroom = DashboardHelpers.groupByHomeroom(studentRecords);
    const eventsByHomeroom = this.homeroomAbsenceEventsByDay(studentsByHomeroom);
    let homeroomAverageDailyAttendance = {};
    Object.keys(eventsByHomeroom).forEach((homeroom) => {
      const homeroomSize = studentsByHomeroom[homeroom].length;
      homeroomAverageDailyAttendance[homeroom] = DashboardHelpers.averageDailyAttendance(eventsByHomeroom[homeroom], homeroomSize);
    });
    return homeroomAverageDailyAttendance;
  }

  homeroomAbsenceEventsByDay(studentsGroupedByHomeroom) {
    let homeroomAbsenceEventsByDay = {};
    Object.keys(studentsGroupedByHomeroom).forEach((homeroom) => {
      const daysWithAbsences = DashboardHelpers.absenceEventsByDay(studentsGroupedByHomeroom[homeroom]);
      homeroomAbsenceEventsByDay[homeroom] = this.addPerfectAttendanceDays(daysWithAbsences);
    });
    return homeroomAbsenceEventsByDay;
  }

  //Because homerooms often have no absences, merge their daily events with the list of school days
  addPerfectAttendanceDays(eventsGroupedByDay) {
    this.schoolDays().forEach((day) => {
      if (!eventsGroupedByDay[day]) eventsGroupedByDay[day] = [];
    });
    return eventsGroupedByDay;
  }

  //There's no application awareness of valid school days, but there are almost never schoolwide perfect attendance days
  //We use days the school has recorded at least one absence as a proxy for school days
  schoolDays() {
    return Object.keys(this.props.schoolAbsenceEvents);
  }

  render() {
    return (
        <SchoolAbsenceDashboard
          schoolAverageDailyAttendance = {this.schoolAverageDailyAttendance()}
          homeroomAverageDailyAttendance = {this.homeroomAverageDailyAttendance()}
          schoolAbsenceEvents = {this.props.schoolAbsenceEvents}
          dashboardStudents = {this.props.dashboardStudents}
          dateRange = {Object.keys(this.schoolAverageDailyAttendance()).sort()}/>);
  }
}

SchoolwideAttendance.propTypes = {
  schoolAbsenceEvents: PropTypes.object.isRequired,
  dashboardStudents: PropTypes.array.isRequired
};

export default SchoolwideAttendance;
