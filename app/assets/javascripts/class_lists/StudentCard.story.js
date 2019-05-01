import React from 'react';
import _ from 'lodash';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {widthFrame} from './storybookFrame';
import {withDefaultNowContext} from '../testing/NowContainer';
import StudentCard from './StudentCard';
import {HighlightKeys} from './studentFilters';
import {testProps} from './StudentCard.test';
import students_for_grade_level_next_year_json from './fixtures/students_for_grade_level_next_year_json';

function storyProps(props = {}) {
  return {
    ...testProps(),
    fetchProfile: action('fetchProfile'),
    ...props
  };
}

storiesOf('classlists/StudentCard', module) // eslint-disable-line no-undef
  .add('plain and with latest_note', () => {
    const defaultProps = storyProps();
    const withNoteProps = {
      ...defaultProps,
      student: {
        ...defaultProps.student,
        latest_note: {
          id: 3342,
          recorded_at: '2018-02-01T15:24:34.820Z'
        }
      }
    };

    return withDefaultNowContext(
      <div style={{width: 250}}>
        <StudentCard {...defaultProps} />
        <StudentCard {...withNoteProps} />
      </div>
    );
  })
  .add('highlights', () => {
    const LIMIT = 10;
    const students = students_for_grade_level_next_year_json.students.slice(0, LIMIT);
    const highlightKeys = _.values(HighlightKeys);
    return widthFrame(withDefaultNowContext(
      <table>
        <thead>
          <tr>{highlightKeys.map(highlightKey => <th key={highlightKey}>{highlightKey}</th>)}</tr>
        </thead>
        <tbody>{students.map(student => (
          <tr key={student.id}>{highlightKeys.map(highlightKey => (
            <td key={highlightKey}><StudentCard {...storyProps({student, highlightKey})} /></td>
          ))}</tr>
        ))}</tbody>
        </table>
    ));
  });
