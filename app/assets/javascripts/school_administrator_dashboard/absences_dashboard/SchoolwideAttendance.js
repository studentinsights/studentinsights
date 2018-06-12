import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import DashboardHelpers from '../DashboardHelpers';
import SchoolAbsenceDashboard from './SchoolAbsenceDashboard';

class SchoolwideAttendance extends React.Component {

  schoolAverageDailyAttendance() {
    return DashboardHelpers.averageDailyAttendance(this.props.schoolAbsenceEvents, this.props.dashboardStudents.length);
  }

  //A separate daily average excluding excused or dismissed absences
  schoolAverageDailyAttendanceUnexcused() {
    return DashboardHelpers.averageDailyAttendance(this.props.unexcusedSchoolAbsenceEvents, this.props.dashboardStudents.length);
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

  homeroomAbsenceEventsByDayUnexcused(studentsGroupedByHomeroom) {
    let homeroomAbsenceEventsByDay = {};
    Object.keys(studentsGroupedByHomeroom).forEach((homeroom) => {
      const absenceEvents = DashboardHelpers.absenceEvents(studentsGroupedByHomeroom[homeroom]);
      const unexcusedAbsenceEvents = absenceEvents.filter((event) => {
        return !event.excused && !event.dismissed;
      });
      const daysWithAbsences = DashboardHelpers.eventsGroupedByDay(unexcusedAbsenceEvents);
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

  schoolYearDateRange() {
    //change this to change the maximum date range available for the dashboard
    const fullYearDateRange = Object.keys(this.schoolAverageDailyAttendance()).sort();
    const today = moment.utc();
    return DashboardHelpers.filterDates(fullYearDateRange, DashboardHelpers.schoolYearStart(), today);
  }

  render() {
    return (
        <SchoolAbsenceDashboard
          schoolAverageDailyAttendance = {this.schoolAverageDailyAttendance()}
          schoolAverageDailyAttendanceUnexcused = {this.schoolAverageDailyAttendanceUnexcused()}
          homeroomAverageDailyAttendance = {this.homeroomAverageDailyAttendance()}
          homeroomAverageDailyAttendanceUnexcused = {this.homeroomAverageDailyAttendanceUnexcused()}
          schoolAbsenceEvents = {this.props.schoolAbsenceEvents}
          dashboardStudents = {this.props.dashboardStudents}
          dateRange = {this.schoolYearDateRange()}/>);
  }
}

SchoolwideAttendance.propTypes = {
  schoolAbsenceEvents: PropTypes.object.isRequired,
  unexcusedSchoolAbsenceEvents: PropTypes.object.isRequired,
  dashboardStudents: PropTypes.array.isRequired
};

export default SchoolwideAttendance;
