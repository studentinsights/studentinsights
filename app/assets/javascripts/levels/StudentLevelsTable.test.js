import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import _ from 'lodash';
import * as Virtualized from 'react-virtualized';
import {withDefaultNowContext} from '../testing/NowContainer';
import unvirtualize from '../testing/unvirtualize';
import StudentLevelsTable, {orderedStudents} from './StudentLevelsTable';
import levelsShowJson from './levelsShowJson.fixture';
const {SortDirection} = Virtualized;


// can't add snapshots with react-virtualized without
// some work, see https://github.com/bvaughn/react-virtualized/issues/1117
// instead, we stub these implementations with naive simple unvirtualized
// ones, to verify the substance of the rendering works
jest.mock('react-virtualized');
unvirtualize(Virtualized, jest.fn);


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


it('snapshots with unvirtualized render', () => {
  const props = testProps();
  const tree = renderer
    .create(withDefaultNowContext(<StudentLevelsTable {...props} />))
    .toJSON();
  expect(tree).toMatchSnapshot();
});
