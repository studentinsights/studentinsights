import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import CourseBreakdownView from './CourseBreakdownView';
import courseBreakdownShowJson from './courseBreakdownShowJson.fixture.js';

function testProps(props = {}) {
  return {
    coursesWithBreakdown: courseBreakdownShowJson.course_breakdown,
    studentProportions: courseBreakdownShowJson.student_proportions,
    ...props
  };
}

function testEl(props) {
  return withDefaultNowContext(
    <PerDistrictContainer districtKey="somerville">
      <CourseBreakdownView {...props} />
    </PerDistrictContainer>
  );
}

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(testEl(props), el);

  expect($(el).find('.Select').length).toEqual(1);
  expect($(el).text()).toContain('Show Race Columns');
  expect($(el).text()).toContain('Show Gender Columns');
  expect($(el).text()).toContain('School Year');
  expect($(el).find('.CoursesTable').length).toEqual(1);
});

// can't add snapshots with react-virtualized without
// some work, see https://github.com/bvaughn/react-virtualized/issues/1117
