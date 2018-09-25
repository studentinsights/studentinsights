import React from 'react';
import ReactDOM from 'react-dom';
import {withDefaultNowContext} from '../testing/NowContainer';
import StudentLevelsTable from './StudentLevelsTable';
import tieringShowJson from './tieringShowJson.fixture';

function testProps(props = {}) {
  return {
    studentsWithTiering: tieringShowJson.students_with_tiering,
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