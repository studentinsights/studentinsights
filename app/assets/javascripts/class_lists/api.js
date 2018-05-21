import qs from 'query-string';
import {apiFetchJson, apiPostJson} from '../helpers/apiFetchJson';


// Fetch the grade levels that we think this educator will want to create classroom
// lists for.
export function fetchGradeLevelsJson(workspaceId) {
  const url = `/api/class_lists/${workspaceId}/available_grade_levels_json`;
  return apiFetchJson(url);
}

// Fetch the list of students for a school and grade level
export function fetchStudentsJson(options = {}) {
  const {workspaceId, gradeLevelNextYear, schoolId} = options;
  const params = {
    grade_level_next_year: gradeLevelNextYear,
    school_id: schoolId
  };
  const url = `/api/class_lists/${workspaceId}/students_for_grade_level_next_year_json?${qs.stringify(params)}`;
  return apiFetchJson(url);
}

// Fetch all class lists the user has access to
export function fetchAllWorkspaces() {
  return apiFetchJson('/api/class_lists/workspaces_json');
}

// Fetch the state of a class list workspace
export function fetchClassListJson(workspaceId) {
  const url = `/api/class_lists/${workspaceId}/class_list_json`;
  return apiFetchJson(url);
}

// Post the state of the user's workspace
export function postClassList(options = {}) {
  const {
    workspaceId,
    stepIndex,
    schoolId,
    gradeLevelNextYear,
    authors,
    classroomsCount,
    planText,
    studentIdsByRoom,
    principalNoteText,
    clientNowMs
  } = options;

  const url = `/api/class_lists/${workspaceId}/update_class_list_json`;
  const body = {
    workspace_id: workspaceId,
    school_id: schoolId,
    grade_level_next_year: gradeLevelNextYear,
    json: {
      stepIndex,
      authors,
      classroomsCount,
      planText,
      studentIdsByRoom,
      principalNoteText,
      clientNowMs
    }
  };
  return apiPostJson(url, body);
}

export function fetchProfile(workspaceId, studentId) {
  const queryString = qs.stringify({
    limit: 10
  });
  const url = `/api/class_lists/${workspaceId}/students/${studentId}/profile_json?${queryString}`;
  return apiFetchJson(url); 
}