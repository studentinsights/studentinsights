import React from 'react';
import _ from 'lodash';
import {storiesOf} from '@storybook/react';
import {widthFrame} from './storybookFrame';
import {withDefaultNowContext} from '../../../../spec/javascripts/support/NowContainer';
import StudentCard from './StudentCard';
import {HighlightKeys} from './studentFilters';
import {testProps} from './StudentCard.test';
import students_for_grade_level_next_year_json from './fixtures/students_for_grade_level_next_year_json';

storiesOf('classlists/StudentCard', module) // eslint-disable-line no-undef
  .add('normal', () => <StudentCard {...testProps()} />)
  .add('highlights', () => {
    const LIMIT = 10;
    const students = students_for_grade_level_next_year_json.students.slice(0, LIMIT);
    const highlightKeys = _.values(HighlightKeys);
    return widthFrame(withDefaultNowContext(
      <table>
        <thead>
          <tr>{highlightKeys.map(highlightKey => <th>{highlightKey}</th>)}</tr>
        </thead>
        <tbody>{students.map(student => (
          <tr>{highlightKeys.map(highlightKey => (
            <td><StudentCard {...testProps({student, highlightKey})} /></td>
          ))}</tr>
        ))}</tbody>
        </table>
    ));
  });
