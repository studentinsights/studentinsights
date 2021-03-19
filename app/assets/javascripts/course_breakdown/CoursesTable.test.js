import React from 'react';
import ReactDOM from 'react-dom';
import * as Virtualized from 'react-virtualized';
import {withDefaultNowContext} from '../testing/NowContainer';
import unvirtualize from '../testing/unvirtualize';
import CoursesTable from './CoursesTable';
import courseBreakdownShowJson from './courseBreakdownShowJson.fixture.js';


// can't add snapshots with react-virtualized without
// some work, see https://github.com/bvaughn/react-virtualized/issues/1117
// instead, we stub these implementations with naive simple unvirtualized
// ones, to verify the substance of the rendering works cf. StudentLevelsTable
jest.mock('react-virtualized');
unvirtualize(Virtualized, jest.fn);


function testProps(props = {}) {
  return {
    filteredCoursesWithBreakdown: courseBreakdownShowJson.course_breakdown,
    columnList: [],
    year: "2018",
    ...props
  };
}

// just a basic smoke test for now
it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(
    <CoursesTable {...props} />
  ), el);
  expect($(el).find('.CoursesTable').length).toEqual(1);
});
