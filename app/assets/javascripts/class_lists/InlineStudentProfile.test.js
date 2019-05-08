import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import InlineStudentProfile from './InlineStudentProfile';
import profile_json from './fixtures/profile_json';
import students_for_grade_level_next_year_json from './fixtures/students_for_grade_level_next_year_json';

function testStudent(attrs = {}) {
  return {
    ...students_for_grade_level_next_year_json.students[0],
    ...attrs
  };
}

export function testProps(props) {
  return {
    fetchProfile(studentId) {
      return Promise.resolve(profile_json);
    },
    student: testStudent({grade: 'KF'}),
    gradeLevelNextYear: '1',
    ...props
  };
}

function testEl(props) {
  return withDefaultNowContext(
    <PerDistrictContainer districtKey="somerville">
      <InlineStudentProfile {...props} />
    </PerDistrictContainer>
  );
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(testEl(props), el);
});

it('snapshots for gradeLevelNextYear=1', () => {
  const props = testProps({
    student: testStudent({grade: 'KF'}),
    gradeLevelNextYear: '1'
  });
  const tree = renderer
    .create(testEl(props))
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('snapshots for gradeLevelNextYear=2', () => {
  const props = testProps({
    student: testStudent({grade: '1'}),
    gradeLevelNextYear: '2'
  });
  const tree = renderer
    .create(testEl(props))
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('snapshots for gradeLevelNextYear=5', () => {
  const props = testProps({
    student: testStudent({grade: '4'}),
    gradeLevelNextYear: '5',
  });
  const tree = renderer
    .create(testEl(props))
    .toJSON();
  expect(tree).toMatchSnapshot();
});