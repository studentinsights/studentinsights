import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import {SortDirection} from 'react-virtualized';
import {withDefaultNowContext} from '../testing/NowContainer';
import StudentLevelsTable, {orderedStudents} from './StudentLevelsTable';
import levelsShowJson from './levelsShowJson.fixture';

function testProps(props = {}) {
  return {
    orderedStudentsWithLevels: levelsShowJson.students_with_levels,
    sortBy: 'levels',
    sortDirection: SortDirection.ASC,
    onTableSort: jest.fn(),
    ...props
  };
}

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(
    <StudentLevelsTable {...props} />
  ), el);
  expect($(el).find('.StudentLevelsTable').length).toEqual(1);
});

describe('orderedStudents', () => {
  it('works', () => {
    const filteredStudents = levelsShowJson.students_with_levels;
    const orderedStudentsList = orderedStudents(filteredStudents, 'science', SortDirection.ASC);
    const orderedGrades = _.compact(_.flatten(orderedStudentsList.map(student => {
      return student.student_section_assignments_right_now.filter(assignment => {
        return assignment.section.id == 6;
      }).map(assignment => assignment.grade_letter);
    })));
    expect(orderedGrades).toEqual(['A', 'C', 'C', 'C', 'F', 'F', 'F', 'F', 'F']);
  });
});

// can't add snapshots with react-virtualized without
// some work, see https://github.com/bvaughn/react-virtualized/issues/1117