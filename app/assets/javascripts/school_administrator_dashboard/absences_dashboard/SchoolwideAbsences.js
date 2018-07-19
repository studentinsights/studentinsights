import React from 'react';
import PropTypes from 'prop-types';

import DashboardHelpers from '../DashboardHelpers';
import SchoolwideAttendance from './SchoolwideAttendance';

class SchoolwideAbsences extends React.Component {

  render() {
    const allAbsenceEvents = DashboardHelpers.absenceEvents(this.props.dashboardStudents);
    return (
      <SchoolwideAttendance
        schoolAbsenceEvents = {allAbsenceEvents}
        schoolAbsenceEventsByDay = {DashboardHelpers.eventsGroupedByDay(allAbsenceEvents)}
        dashboardStudents = {this.props.dashboardStudents}
        school={this.props.school}
      />
    );
  }
}

SchoolwideAbsences.propTypes = {
  dashboardStudents: PropTypes.array.isRequired,
  school: PropTypes.object.isRequired
};

export default SchoolwideAbsences;
