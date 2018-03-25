import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import SchoolDisciplineDashboard from './SchoolDisciplineDashboard';
import DashboardHelpers from '../DashboardHelpers';
import {latestNoteDateText} from '../../../helpers/latestNoteDateText';

class SchoolWideDisciplineIncidents extends React.Component {

  schoolDisciplineEvents() {
    //structures the discipline incident data for easy grouping
    const students = this.props.dashboardStudents;
    const startDate = DashboardHelpers.schoolYearStart();
    let schoolDisciplineEvents = [];
    students.forEach((student) => {
      student.discipline_incidents.forEach((incident) => {
        if (moment(incident.occurred_at).isSameOrAfter(moment(startDate))) {
          schoolDisciplineEvents.push({
            student_id: incident.student_id,
            location: incident.incident_location,
            time: incident.has_exact_time ? moment(incident.occurred_at).format("h A") : "Not Logged",
            classroom: student.homeroom_label,
            student_grade: student.grade,
            day: moment(incident.occurred_at).format("ddd"),
            offense: incident.incident_code,
            student_race: student.race,
            occurred_at: incident.occurred_at,
            last_sst_date_text: latestNoteDateText(300, student.event_notes)
          });
        }
      });
    });

    return schoolDisciplineEvents;
  }

  render() {
    const schoolDisciplineEvents = this.schoolDisciplineEvents();
    return (
      <SchoolDisciplineDashboard
        dashboardStudents={this.props.dashboardStudents}
        totalDisciplineIncidents={schoolDisciplineEvents}/>
    );
  }
}

SchoolWideDisciplineIncidents.propTypes = {
  dashboardStudents: PropTypes.array.isRequired
};

export default SchoolWideDisciplineIncidents;
