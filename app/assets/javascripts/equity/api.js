import qs from 'query-string';
import {apiFetchJson, apiPostJson} from '../helpers/apiFetchJson';


// Fetch the grade levels that we think this educator will want to create classroom
// lists for.
export function fetchGradeLevelsJson(balanceId) {
  const url = `/api/balancing/${balanceId}/available_grade_levels_json`;
  return apiFetchJson(url);
}

// Fetch the list of students for a school and grade level
export function fetchStudentsJson(options = {}) {
  const {balanceId, gradeLevelNextYear, schoolId} = options;
  const params = {
    grade_level_next_year: gradeLevelNextYear,
    school_id: schoolId
  };
  const url = `/api/balancing/${balanceId}/students_for_grade_level_next_year_json?${qs.stringify(params)}`;
  return apiFetchJson(url);
}

// Post the state of the user's work
export function postClassroomsForGrade(options = {}) {
  const {
    balanceId,
    stepIndex,
    schoolId,
    gradeLevelNextYear,
    educators,
    classroomsCount,
    planText,
    studentIdsByRoom,
    principalNotesText,
    clientNowMs
  } = options;

  const url = `/api/balancing/${balanceId}/update_classrooms_for_grade_json`;
  const body = {
    balance_id: balanceId,
    school_id: schoolId,
    grade_level_next_year: gradeLevelNextYear,
    json: {
      stepIndex,
      educators,
      classroomsCount,
      planText,
      studentIdsByRoom,
      principalNotesText,
      clientNowMs
    }
  };
  return apiPostJson(url, body);
}

export function fetchProfile(balanceId, studentId) {
  const queryString = qs.stringify({
    limit: 10
  });
  const url = `/api/balancing/${balanceId}/students/${studentId}/profile_json?${queryString}`;
  return apiFetchJson(url); 
}