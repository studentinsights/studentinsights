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
    const unexcusedSchoolAbsenceEvents = DashboardHelpers.filterExcusedEvents(this.props.schoolAbsenceEvents);
    const unexcusedAbsencesByDay = DashboardHelpers.eventsGroupedByDay(unexcusedSchoolAbsenceEvents);
    return DashboardHelpers.averageDailyAttendance(unexcusedAbsencesByDay, this.props.dashboardStudents.length);
  }

  homeroomAverageDailyAttendance(homeroomEventsByDay) {
    //
    const studentRecords = this.props.dashboardStudents;
    const studentsByHomeroom = DashboardHelpers.groupByHomeroom(studentRecords);
    let homeroomAverageDailyAttendance = {};
    Object.keys(homeroomEventsByDay).forEach((homeroom) => {
      const homeroomSize = studentsByHomeroom[homeroom].length;
      homeroomAverageDailyAttendance[homeroom] = DashboardHelpers.averageDailyAttendance(homeroomEventsByDay[homeroom], homeroomSize);
    });
    return homeroomAverageDailyAttendance;
  }

  homeroomAbsenceEventsByDay(studentsGroupedByHomeroom) {
    let homeroomAbsenceEventsByDay = {};
    Object.keys(studentsGroupedByHomeroom).forEach((homeroom) => {
      const absenceEvents = DashboardHelpers.absenceEvents(studentsGroupedByHomeroom[homeroom]);
      const daysWithAbsences = DashboardHelpers.eventsGroupedByDay(absenceEvents);
      homeroomAbsenceEventsByDay[homeroom] = this.addPerfectAttendanceDays(daysWithAbsences);
    });
    return homeroomAbsenceEventsByDay;
  }

  HomeroomAbsenceEventsByDayunexcused(studentsGroupedByHomeroom) {
    //Same as above excluding excused absences
    let HomeroomAbsenceEventsByDayunexcused = {};
    Object.keys(studentsGroupedByHomeroom).forEach((homeroom) => {
      const absenceEvents = DashboardHelpers.absenceEvents(studentsGroupedByHomeroom[homeroom]);
      const unexcusedAbsenceEvents = DashboardHelpers.filterExcusedEvents(absenceEvents);
      const daysWithAbsences = DashboardHelpers.eventsGroupedByDay(unexcusedAbsenceEvents);
      HomeroomAbsenceEventsByDayunexcused[homeroom] = this.addPerfectAttendanceDays(daysWithAbsences);
    });
    return HomeroomAbsenceEventsByDayunexcused;
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
    return Object.keys(this.props.schoolAbsenceEventsByDay);
  }

  schoolYearDateRange() {
    //change this to change the maximum date range available for the dashboard
    const fullYearDateRange = Object.keys(this.props.schoolAbsenceEventsByDay).sort();
    const today = moment.utc();
    return DashboardHelpers.filterDates(fullYearDateRange, DashboardHelpers.schoolYearStart(), today);
  }

  render() {
    const studentsByHomeroom = DashboardHelpers.groupByHomeroom(this.props.dashboardStudents);
    return (
        <SchoolAbsenceDashboard
          schoolAverageDailyAttendance = {this.schoolAverageDailyAttendance()}
          schoolAverageDailyAttendanceUnexcused = {this.schoolAverageDailyAttendanceUnexcused()}
          homeroomAverageDailyAttendance = {this.homeroomAverageDailyAttendance(this.homeroomAbsenceEventsByDay(studentsByHomeroom))}
          homeroomAverageDailyAttendanceUnexcused = {this.homeroomAverageDailyAttendance(this.HomeroomAbsenceEventsByDayunexcused(studentsByHomeroom))}
          schoolAbsenceEventsByDay = {this.props.schoolAbsenceEventsByDay}
          dashboardStudents = {this.props.dashboardStudents}
          dateRange = {this.schoolYearDateRange()}/>);
  }
}

SchoolwideAttendance.propTypes = {
  schoolAbsenceEvents: PropTypes.array.isRequired,
  schoolAbsenceEventsByDay: PropTypes.object.isRequired,
  dashboardStudents: PropTypes.array.isRequired
};

export default SchoolwideAttendance;