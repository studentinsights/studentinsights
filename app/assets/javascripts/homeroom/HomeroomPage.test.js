import React from 'react';
import ReactDOM from 'react-dom';
import {withDefaultNowContext} from '../testing/NowContainer';
import {SOMERVILLE} from '../helpers/PerDistrict';
import PerDistrictContainer from '../components/PerDistrictContainer';
import fetchMock from 'fetch-mock/es5/client';
import HomeroomPage from './HomeroomPage';
import homeroomJson from './homeroomJson.fixture';

function testProps(props = {}) {
  return {
    homeroomIdOrSlug: 'hea-500',
    ...props
  };
}

function testRender(props = {}, context = {}) {
  const districtKey = context.districtKey || SOMERVILLE;
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(
    <PerDistrictContainer districtKey={districtKey}>
      <HomeroomPage {...props} />
    </PerDistrictContainer>
  ), el);
  return {el};
}

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/homerooms/hea-500/homeroom_json', homeroomJson);
});

it('renders without crashing', () => {
  const props = testProps();
  testRender(props);
});

it('renders everything after fetch', done => {
  const props = testProps();
  const {el} = testRender(props);
  
  setTimeout(() => {
    expect($(el).text()).toContain('Homeroom: HEA 500');
    expect($(el).text()).toContain('5th grade');
    expect($(el).text()).toContain('with Sarah Teacher');
    expect($(el).text()).toContain('at Arthur D Healey');
    done();
  }, 0);
});
