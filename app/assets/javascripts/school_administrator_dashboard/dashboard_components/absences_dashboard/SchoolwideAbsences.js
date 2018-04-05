import React from 'react';
import PropTypes from 'prop-types';

import DashboardHelpers from '../DashboardHelpers';
import SchoolwideAttendance from './SchoolwideAttendance';

class SchoolwideAbsences extends React.Component {

  render() {
    return (
      <SchoolwideAttendance
        schoolAbsenceEvents = {DashboardHelpers.absenceEventsByDay(this.props.dashboardStudents)}
        dashboardStudents = {this.props.dashboardStudents}/>);
  }
}

SchoolwideAbsences.propTypes = {
  dashboardStudents: PropTypes.array.isRequired
};

export default SchoolwideAbsences;
