import React from 'react';
import ReactDOM from 'react-dom';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import fetchMock from 'fetch-mock/es5/client';
import TieringPage from './TieringPage';
import tieringShowJson from './tieringShowJson.fixture';

function testProps(props = {}) {
  return {
    schoolId: 'shs',
    ...props
  };
}

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<PerDistrictContainer districtKey="somerville">
    <TieringPage {...props} />
  </PerDistrictContainer>), el);
  return el;
}

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/tiering/shs/show_json', tieringShowJson);
});

it('renders without crashing', () => {
  testRender(testProps());
});

it('renders everything after fetch', done => {
  const props = testProps();
  const el = testRender(props);
  expect($(el).text()).toContain('HS Levels: v1 prototype');

  setTimeout(() => {
    expect($(el).find('.TieringView').length).toEqual(1);
    done();
  }, 0);
});
