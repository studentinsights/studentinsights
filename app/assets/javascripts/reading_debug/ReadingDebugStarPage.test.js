import React from 'react';
import ReactDOM from 'react-dom';
import fetchMock from 'fetch-mock/es5/client';
import renderer from 'react-test-renderer';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import ReadingDebugStarPage, {ReadingDebugStarView} from './ReadingDebugStarPage';
import starReadingDebugJson from './star_reading_debug_json.fixture.js';

beforeEach(() => {
  fetchMock.reset();
  fetchMock.restore();
  fetchMock.get('express:/api/reading_debug/star_reading_debug_json', starReadingDebugJson);
});

export function testProps(props = {}) {
  return {
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(<ReadingDebugStarPage {...props} />, el);
});


it('snapshots view', () => {
  const json = starReadingDebugJson;
  const props = testProps({
    students: json.students,
    cutoffMoment: toMomentFromTimestamp(json.cutoff_date),
    grades: json.grades,
    schools: json.schools,
    starReadings: json.star_readings
  });
  const tree = renderer
    .create(<ReadingDebugStarView {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});