import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import _ from 'lodash';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import ReaderProfileJune from './ReaderProfileJune';
import json from './ReaderProfileJune.fixture';


export function testProps(props) {
  return {
    student: _.first(json.feed_cards).json.student, // hacking around
    access: json.access,
    services: json.services,
    iepContents: json.iep_contents,
    feedCards: json.feed_cards,
    currentSchoolYear: json.current_school_year,
    dataPointsByAssessmentKey: _.groupBy(json.benchmark_data_points, 'benchmark_assessment_key'),
    ...props
  };
}

export function testEl(props, context = {}) {
  const districtKey = context.districtKey || 'somerville';
  return withDefaultNowContext(
    <PerDistrictContainer districtKey={districtKey}>
      <ReaderProfileJune {...props} />
    </PerDistrictContainer>
  );
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(testEl(testProps()), el);
  expect(el.textContent).toContain('See themselves as a reader');
  expect(el.textContent).toContain('Communicate with oral language');
  expect(el.textContent).toContain('Speak and listen in English');
  expect(el.textContent).toContain('Discriminate Sounds in Words');
  expect(el.textContent).toContain('Represent Sounds with Letters');
});

it('snapshots view', () => {
  const tree = renderer
    .create(testEl(testProps()))
    .toJSON();
  expect(tree).toMatchSnapshot();
});