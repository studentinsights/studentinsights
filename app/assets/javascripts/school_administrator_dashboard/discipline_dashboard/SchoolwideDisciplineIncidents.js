import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import SchoolDisciplineDashboard from './SchoolDisciplineDashboard';
import DashboardHelpers from '../DashboardHelpers';

class SchoolWideDisciplineIncidents extends React.Component {

  schoolDisciplineEvents() {
    //structures the discipline incident data for easy grouping
    const students = this.props.dashboardStudents;
    const startDate = DashboardHelpers.schoolYearStart();
    let schoolDisciplineEvents = [];
    students.forEach((student) => {
      student.discipline_incidents.forEach((incident) => {
        if (moment.utc(incident.occurred_at).isSameOrAfter(moment.utc(startDate))) {
          schoolDisciplineEvents.push({
            student_id: incident.student_id,
            location: incident.incident_location || "Not Recorded",
            time: incident.has_exact_time ? moment.utc(incident.occurred_at).startOf('hour').format('h:mm a') : "Not Logged",
            classroom: student.homeroom_label,
            grade: student.grade,
            day: moment.utc(incident.occurred_at).format("ddd"),
            offense: incident.incident_code,
            student_race: student.race,
            occurred_at: incident.occurred_at
          });
        }
      });
    });

    return schoolDisciplineEvents;
  }

  render() {
    return (
      <SchoolDisciplineDashboard
        dashboardStudents={this.props.dashboardStudents}
        schoolDisciplineEvents={this.schoolDisciplineEvents()}/>
    );
  }
}

SchoolWideDisciplineIncidents.propTypes = {
  dashboardStudents: PropTypes.array.isRequired
};

export default SchoolWideDisciplineIncidents;
