import fetchMock from 'fetch-mock/es5/client';
import available_grade_levels_json from './available_grade_levels_json';
import class_list_json from './class_list_json';
import students_for_grade_level_next_year_json from './students_for_grade_level_next_year_json';
import workspaces_json from './workspaces_json';

export default function mockWithFixtures() {
  fetchMock.reset();
  fetchMock.restore();
  fetchMock.get('express:/api/class_lists/workspaces_json', workspaces_json);
  fetchMock.get('express:/api/class_lists/:workspace_id/available_grade_levels_json', available_grade_levels_json);
  fetchMock.get('express:/api/class_lists/:workspace_id/students_for_grade_level_next_year_json?(.*)', students_for_grade_level_next_year_json);
  fetchMock.get('express:/api/class_lists/:workspace_id/class_list_json', class_list_json);
  fetchMock.post('express:/api/class_lists/:workspace_id/update_class_list_json', {});
}