import React from 'react';
import ReactDOM from 'react-dom';
import fetchMock from 'fetch-mock/es5/client';
import renderer from 'react-test-renderer';
import ReadingDebugPage, {ReadingDebugView} from './ReadingDebugPage';
import readingDebugJson from './reading_debug_json.fixture';

beforeEach(() => {
  fetchMock.reset();
  fetchMock.restore();
  fetchMock.get('express:/api/reading/reading_debug_json', readingDebugJson);
});

export function testProps(props = {}) {
  return {
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(<ReadingDebugPage {...props} />, el);
});


it('snapshots view', () => {
  const json = readingDebugJson;
  const props = testProps({
    students: json.students,
    readingBenchmarkDataPoints: json.reading_benchmark_data_points
  });
  const tree = renderer
    .create(<ReadingDebugView {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});