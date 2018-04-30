import qs from 'query-string';
import {apiFetchJson} from '../helpers/apiFetchJson';


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