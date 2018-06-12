import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../testing/NowContainer';
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
    fetchProfile() {},
    ...props
  };
}

export function testEl(props = {}) {
  return withDefaultNowContext(<ExportList {...props} />);
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(testEl(props), el);
});

it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(testEl(props))
    .toJSON();
  expect(tree).toMatchSnapshot();
});
