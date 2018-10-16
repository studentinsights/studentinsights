import React from 'react';
import ReactDOM from 'react-dom';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import LevelsView from './LevelsView';
import levelsShowJson from './levelsShowJson.fixture';

function testProps(props = {}) {
  return {
    systemsAndSupportsUrl: 'https://example.com/foo',
    sourceCodeUrl: 'https://example.com/source',
    studentsWithLevels: levelsShowJson.students_with_levels,
    ...props
  };
}

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(
    <PerDistrictContainer districtKey="somerville"><LevelsView {...props} /></PerDistrictContainer>
  ), el);

  expect($(el).html()).toContain('Search 74 students...');
  expect($(el).find('.Select').length).toEqual(5);
  expect($(el).text()).toContain('Grade...');
  expect($(el).text()).toContain('House...');
  expect($(el).text()).toContain('Level...');
  expect($(el).text()).toContain('Trigger...');
  expect($(el).find('.StudentLevelsTable').length).toEqual(1);
});

// can't add snapshots with react-virtualized without
// some work, see https://github.com/bvaughn/react-virtualized/issues/1117