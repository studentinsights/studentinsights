import React from 'react';
import ReactDOM from 'react-dom';
import fetchMock from 'fetch-mock/es5/client';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import ReadingDebugPage, {viewPropsFromJson, ReadingDebugView} from './ReadingDebugPage';
import readingDebugJson from './reading_debug_json.fixture';

beforeEach(() => {
  fetchMock.reset();
  fetchMock.restore();
  fetchMock.get('express:/api/reading_debug/reading_debug_json', readingDebugJson);
});

export function withTestContext(children) {
  return withDefaultNowContext(
    <PerDistrictContainer districtKey="somerville">
      {children}
    </PerDistrictContainer>
  );
}


it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(withTestContext(<ReadingDebugPage />), el);
});


it('snapshots view', () => {
  const props = viewPropsFromJson({
    json: readingDebugJson,
    onSchoolIdNowChanged: jest.fn()
  });
  const tree = renderer
    .create(withTestContext(<ReadingDebugView {...props} />))
    .toJSON();
  expect(tree).toMatchSnapshot();
});