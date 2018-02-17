import React from 'react';
import PropTypes from 'prop-types';

import DashboardHelpers from '../DashboardHelpers.js';
import SchoolwideAttendance from './SchoolwideAttendance.jsx';

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
