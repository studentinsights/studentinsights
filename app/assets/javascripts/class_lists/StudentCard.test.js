import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import StudentCard from './StudentCard';
import students_for_grade_level_next_year_json from './fixtures/students_for_grade_level_next_year_json';


export function testProps(props = {}) {
  const student = students_for_grade_level_next_year_json.students[0];
  return {
    student: {...student, grade: 'KF' },
    gradeLevelNextYear: '1',
    index: 0,
    isEditable: false,
    fetchProfile: jest.fn(),
    highlightKey: null,
    ...props
  };
}

function testEl(props = {}) {
  return withDefaultNowContext(
    <PerDistrictContainer districtKey="somerville">
      <StudentCard {...props} />
    </PerDistrictContainer>
  );
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