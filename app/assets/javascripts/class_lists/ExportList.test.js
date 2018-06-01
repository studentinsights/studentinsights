import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import ExportList from './ExportList';
import students_for_grade_level_next_year_json from './fixtures/students_for_grade_level_next_year_json';
import {exportPropsWithTeacherNames} from './ClassListCreatorWorkflow.test';


export function testProps(props = {}) {
  const workflowProps = exportPropsWithTeacherNames();
  return {
    ...workflowProps,
    school: {
      name: 'Awesome school'
    },
    teacherStudentIdsByRoom: workflowProps.studentIdsByRoom,
    educators: students_for_grade_level_next_year_json.educators,
    fetchProfile: function() {},
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(<ExportList {...props} />, el);
});

it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(<ExportList {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
