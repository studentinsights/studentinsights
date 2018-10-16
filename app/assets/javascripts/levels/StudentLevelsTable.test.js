import React from 'react';
import ReactDOM from 'react-dom';
import {SortDirection} from 'react-virtualized';
import {withDefaultNowContext} from '../testing/NowContainer';
import StudentLevelsTable from './StudentLevelsTable';
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

// can't add snapshots with react-virtualized without
// some work, see https://github.com/bvaughn/react-virtualized/issues/1117