import React from 'react';
import ReactDOM from 'react-dom';
import {withDefaultNowContext} from '../../../../spec/javascripts/support/NowContainer';
import InlineStudentProfile from './InlineStudentProfile';
import profile_json from './fixtures/profile_json';
import students_for_grade_level_next_year_json from './fixtures/students_for_grade_level_next_year_json';


export function testProps(props) {
  return {
    fetchProfile(studentId) {
      return Promise.resolve(profile_json);
    },
    student: students_for_grade_level_next_year_json.students[0],
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(withDefaultNowContext(<InlineStudentProfile {...props} />), el);
});
