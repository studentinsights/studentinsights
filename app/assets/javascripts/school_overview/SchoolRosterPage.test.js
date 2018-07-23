import React from 'react';
import ReactDOM from 'react-dom';
import {withDefaultNowContext} from '../testing/NowContainer';
import {SOMERVILLE} from '../helpers/PerDistrict';
import PerDistrictContainer from '../components/PerDistrictContainer';
import fetchMock from 'fetch-mock/es5/client';
import SchoolRosterPage from './SchoolRosterPage';
import schoolOverviewJson from './schoolOverviewJson.fixture';

function testProps(props = {}) {
  return {
    schoolIdOrSlug: 'HEA',
    ...props
  };
}

function testRender(props = {}, context = {}) {
  const districtKey = context.districtKey || SOMERVILLE;
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(
    <PerDistrictContainer districtKey={districtKey}>
      <SchoolRosterPage {...props} />
    </PerDistrictContainer>
  ), el);
  return {el};
}

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get(`/schools/HEA/overview_json`, schoolOverviewJson);
});

it('renders without crashing', () => {
  const props = testProps();
  testRender(props);
});

it('renders everything after fetch', done => {
  const props = testProps();
  const {el} = testRender(props);
  
  setTimeout(() => {
    expect($(el).html()).toContain('Found: 26 students');
    done();
  }, 0);
});
