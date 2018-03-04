import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import SchoolDisciplineDashboard from './SchoolDisciplineDashboard';

class SchoolWideDisciplineIncidents extends React.Component {

  schoolDisciplineEvents() {
    //structures the discipline incident data for easy grouping
    const students = this.props.dashboardStudents;
    let schoolDisciplineEvents = [];
    students.forEach((student) => {
      student.discipline_incidents.forEach((incident) => {
        schoolDisciplineEvents.push({
          student_id: incident.student_id,
          location: incident.incident_location,
          time: incident.has_exact_time,
          classroom: null,
          student_grade: student.grade,
          day: moment(incident.occurred_at).format("DDD"),
          offense: incident.incident_code,
          student_race: student.race,
          occurred_at: incident.occurred_at
        });
      });
    });

    return schoolDisciplineEvents;
  }

  render() {
    const schoolDisciplineEvents = this.schoolDisciplineEvents();
    return (
      <SchoolDisciplineDashboard
        disciplineIncidentsByLocation={_.groupBy(schoolDisciplineEvents, 'location')}
        disciplineIncidentsByTime={_.groupBy(schoolDisciplineEvents, 'time')}
        disciplineIncidentsByClassroomn={_.groupBy(schoolDisciplineEvents, 'classroom')}
        disciplineIncidentsByGrade={_.groupBy(schoolDisciplineEvents, 'student_grade')}
        disciplineIncidentsByDay={_.groupBy(schoolDisciplineEvents, 'day')}
        disciplineIncidentsByOffense={_.groupBy(schoolDisciplineEvents, 'offense')}
        disciplineIncidentsByRace={_.groupBy(schoolDisciplineEvents, 'student_race')}
      />
    );
  }
}

SchoolWideDisciplineIncidents.propTypes = {
  dashboardStudents: PropTypes.array.isRequired
};

export default SchoolWideDisciplineIncidents;
