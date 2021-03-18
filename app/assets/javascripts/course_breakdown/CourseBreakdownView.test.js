import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import CourseBreakdownView from './CourseBreakdownView';
import levelsShowJson from './levelsShowJson.fixture';

function testProps(props = {}) {
  return {
    studentsWithLevels: levelsShowJson.students_with_levels,
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

  expect($(el).html()).toContain('Search 74 students...');
  expect($(el).find('.Select').length).toEqual(6);
  expect($(el).text()).toContain('Grade...');
  expect($(el).text()).toContain('House...');
  expect($(el).text()).toContain('Counselor...');
  expect($(el).text()).toContain('Level...');
  expect($(el).text()).toContain('Trigger...');
  expect($(el).find('.StudentLevelsTable').length).toEqual(1);
});

// can't add snapshots with react-virtualized without
// some work, see https://github.com/bvaughn/react-virtualized/issues/1117
