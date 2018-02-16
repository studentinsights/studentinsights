import React from 'react';
import _ from 'lodash';

import DashboardHelpers from '../DashboardHelpers.js';
import SchoolTardiesDashboard from './SchoolTardiesDashboard.jsx';

export default React.createClass({
  displayName: 'SchoolwideTardies',

  propTypes: {
    dashboardStudents: React.PropTypes.array.isRequired
  },

  schoolTardyEvents: function() {
    const studentRecords = this.props.dashboardStudents;
    return DashboardHelpers.tardyEventsByDay(studentRecords);
  },

  homeroomTardyEvents: function() {
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
  },

  render: function() {
    return (
        <SchoolTardiesDashboard
          schoolTardyEvents = {this.schoolTardyEvents()}
          homeroomTardyEvents = {this.homeroomTardyEvents()}
          dashboardStudents = {this.props.dashboardStudents}/>);
  }
});
