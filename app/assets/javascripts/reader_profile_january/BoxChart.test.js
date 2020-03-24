import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import {firstGradeWinter} from './BoxChart.fixture.js';
import BoxChart, {renderDibelsBoxFn, renderRawDibelsScoreBoxFn} from './BoxChart';


// this test data is only correct shape, but not semantically meaningful
export function testProps(props = {}) {
  return {
    gradeNow: '1',
    benchmarkAssessmentKey: 'f_and_p_english',
    readerJson: {
      access: {},
      services: [],
      iep_contents: null,
      feed_cards: [],
      "current_school_year": 2019,
      "benchmark_data_points": firstGradeWinter
    },
    renderBoxFn: renderDibelsBoxFn,
    ...props
  };
}

export function testRender(props = {}) {
  return withNowContext('2020-01-03T14:36:34.501Z',
    <PerDistrictContainer districtKey="somerville">
      <BoxChart {...props} />
    </PerDistrictContainer>
  );
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(testRender(testProps()), el);
});


it('snapshots renderDibelsBoxFn', () => {
  const tree = renderer.create(testRender(testProps())).toJSON();
  expect(tree).toMatchSnapshot();
});

it('snapshots renderRawDibelsScoreBoxFn', () => {
  const tree = renderer.create(testRender(testProps({renderBoxFn: renderRawDibelsScoreBoxFn}))).toJSON();
  expect(tree).toMatchSnapshot();
});