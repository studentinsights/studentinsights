import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../../../../spec/javascripts/support/NowContainer';
import StudentCard from './StudentCard';
import students_for_grade_level_next_year_json from './fixtures/students_for_grade_level_next_year_json';

export function testProps(props = {}) {
  const student = students_for_grade_level_next_year_json.students[0];
  return {
    student,
    index: 0,
    isEditable: false,
    fetchProfile: jest.fn(),
    highlightKey: null,
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(withDefaultNowContext(<StudentCard {...props} />), el);
});


it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(withDefaultNowContext(<StudentCard {...props} />))
    .toJSON();
  expect(tree).toMatchSnapshot();
});