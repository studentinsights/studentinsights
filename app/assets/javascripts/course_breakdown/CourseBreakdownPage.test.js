import React from 'react';
import ReactDOM from 'react-dom';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import fetchMock from 'fetch-mock/es5/client';
import CourseBreakdownPage from './CourseBreakdownPage';
import levelsShowJson from './levelsShowJson.fixture';

function testProps(props = {}) {
  return {
    schoolId: 'shs',
    ...props
  };
}

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<PerDistrictContainer districtKey="somerville">
    <CourseBreakdownPage {...props} />
  </PerDistrictContainer>), el);
  return el;
}

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/levels/shs/show_json', levelsShowJson);
});

it('renders without crashing', () => {
  testRender(testProps());
});

it('renders everything after fetch', done => {
  const props = testProps();
  const el = testRender(props);
  expect($(el).text()).toContain('Levels for SHS Systems and Supports');

  setTimeout(() => {
    expect($(el).find('.LevelsView').length).toEqual(1);
    expect($(el).find('.ReactVirtualized__Table__row').length).toEqual(29); // tied to the dimensions used in test
    done();
  }, 0);
});
