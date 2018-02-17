import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import DashboardHelpers from '../DashboardHelpers.js';
import SchoolTardiesDashboard from './SchoolTardiesDashboard.jsx';

class SchoolwideTardies extends React.Component {

  schoolTardyEvents() {
    const studentRecords = this.props.dashboardStudents;
    return DashboardHelpers.tardyEventsByDay(studentRecords);
  }

  homeroomTardyEvents() {
    let homeroomTardyEvents = {};
    const studentRecords = this.props.dashboardStudents;
    const studentsByHomeroom = DashboardHelpers.groupByHomeroom(studentRecords);
    const schoolYearStart = DashboardHelpers.schoolYearStart();
    Object.keys(studentsByHomeroom).forEach((homeroom) => {
      homeroomTardyEvents[homeroom] = 0;
      _.each(studentsByHomeroom[homeroom], (student) => {
        student.tardies.forEach((tardy) => {
          if (moment(tardy.occurred_at).isSameOrAfter(schoolYearStart)) {
            homeroomTardyEvents[homeroom]++;
          }
        });
      });
    });
    return homeroomTardyEvents;
  }

  render() {
    return (
        <SchoolTardiesDashboard
          schoolTardyEvents = {this.schoolTardyEvents()}
          homeroomTardyEvents = {this.homeroomTardyEvents()}
          dashboardStudents = {this.props.dashboardStudents}/>);
  }
}

SchoolwideTardies.propTypes = {
  dashboardStudents: PropTypes.array.isRequired
};

export default SchoolwideTardies;
