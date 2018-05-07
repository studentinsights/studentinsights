import fetchMock from 'fetch-mock/es5/client';
import available_grade_levels_json from './available_grade_levels_json';
import students_for_grade_level_next_year_json from './students_for_grade_level_next_year_json';

export default function mockWithFixtures() {
  fetchMock.restore();
  fetchMock.get('express:/api/class_lists/:workspace_id/available_grade_levels_json', available_grade_levels_json);
  fetchMock.get('express:/api/class_lists/:workspace_id/students_for_grade_level_next_year_json?(.*)', students_for_grade_level_next_year_json);
  fetchMock.post('express:/api/class_lists/:workspace_id/update_class_list_json', {});
}