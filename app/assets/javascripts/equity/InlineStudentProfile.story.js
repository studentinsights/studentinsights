import React from 'react';
import {storiesOf} from '@storybook/react';
import {withDefaultNowContext} from '../../../../spec/javascripts/support/NowContainer';
import InlineStudentProfile from './InlineStudentProfile';
import students_for_grade_level_next_year_json from './fixtures/students_for_grade_level_next_year_json';
import profile_json from './fixtures/profile_json';


function testProps(props) {
  return {
    fetchProfile(studentId) {
      return Promise.resolve(profile_json);
    },
    student: students_for_grade_level_next_year_json.students[0],
    ...props
  };
}

storiesOf('equity/InlineStudentProfile', module) // eslint-disable-line no-undef
  .add("normal", () => {
    const props = testProps();
    return withDefaultNowContext(
      <div style={{width: '100%', background: '#333'}}>
        <div style={{position: 'relative', width: 660, left: 100, top: 100, border: '5px solid #333', background: 'white'}}>
          <InlineStudentProfile {...props} />)
        </div>
      </div>
    );
  });
