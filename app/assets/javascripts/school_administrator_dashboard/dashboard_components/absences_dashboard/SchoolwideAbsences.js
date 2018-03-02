import React from 'react';
import PropTypes from 'prop-types';

import DashboardHelpers from '../DashboardHelpers';
import SchoolwideAttendance from './SchoolwideAttendance';

class SchoolwideAbsences extends React.Component {

  schoolAbsenceEvents() {
    const studentRecords = this.props.dashboardStudents;
    return DashboardHelpers.absenceEventsByDay(studentRecords);
  }

  render() {
    return (
        <SchoolwideAttendance
          schoolAbsenceEvents = {this.schoolAbsenceEvents()}
          dashboardStudents = {this.props.dashboardStudents}/>);
  }
}

SchoolwideAbsences.propTypes = {
  dashboardStudents: PropTypes.array.isRequired
};

export default SchoolwideAbsences;
