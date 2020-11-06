import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import ConnectionsView from './ConnectionsView';
import connectionsShowJson from './connectionsShowJson.fixture';

function testProps(props = {}) {
  return {
    systemsAndSupportsUrl: 'https://example.com/foo',
    sourceCodeUrl: 'https://example.com/source',
    studentsWith2020Surveys: connectionsShowJson.students_with_2020_survey_data,
    ...props
  };
}

function testEl(props) {
  return withDefaultNowContext(
    <PerDistrictContainer districtKey="somerville">
      <ConnectionsView {...props} />
    </PerDistrictContainer>
  );
}

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(testEl(props), el);

  expect($(el).html()).toContain('Search 8 students...');
  expect($(el).find('.Select').length).toEqual(4);
  expect($(el).text()).toContain('Language...');
  expect($(el).text()).toContain('Grade...');
  expect($(el).text()).toContain('House...');
  expect($(el).text()).toContain('Counselor...');
  expect($(el).find('.StudentConnectionsTable').length).toEqual(1);
});

// can't add snapshots with react-virtualized without
// some work, see https://github.com/bvaughn/react-virtualized/issues/1117

