import React from 'react';
import PropTypes from 'prop-types';

import DashboardHelpers from '../DashboardHelpers';
import SchoolwideAttendance from './SchoolwideAttendance';

class SchoolwideAbsences extends React.Component {

  render() {
    const allAbsenceEvents = DashboardHelpers.absenceEvents(this.props.dashboardStudents);
    const unexcusedAbsenceEvents = allAbsenceEvents.filter((event) => {
      //different districts have different ways of marking excused absences, this attempts to catch both
      return !event.excused && !event.dismissed;
    });
    return (
      <SchoolwideAttendance
        schoolAbsenceEvents = {DashboardHelpers.eventsGroupedByDay(allAbsenceEvents)}
        unexcusedSchoolAbsenceEvents = {DashboardHelpers.eventsGroupedByDay(unexcusedAbsenceEvents)}
        dashboardStudents = {this.props.dashboardStudents}/>);
  }
}

SchoolwideAbsences.propTypes = {
  dashboardStudents: PropTypes.array.isRequired
};

export default SchoolwideAbsences;
