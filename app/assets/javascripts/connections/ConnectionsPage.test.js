import React from 'react';
import ReactDOM from 'react-dom';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import fetchMock from 'fetch-mock/es5/client';
import ConnectionsPage from './ConnectionsPage';
import connectionsShowJson from './connectionsShowJson.fixture';

function testProps(props = {}) {
  return {
    schoolId: 'shs',
    ...props
  };
}

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<PerDistrictContainer districtKey="somerville">
    <ConnectionsPage {...props} />
  </PerDistrictContainer>), el);
  return el;
}

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/connections/shs/show_json', connectionsShowJson);
});

it('renders without crashing', () => {
  testRender(testProps());
});

it('renders everything after fetch', done => {
  const props = testProps();
  const el = testRender(props);
  expect($(el).text()).toContain('Students who need adults to connect to in SHS');

  setTimeout(() => {
    expect($(el).find('.ConnectionsView').length).toEqual(1);
    expect($(el).find('.ReactVirtualized__Table__row').length).toEqual(8); // tied to the dimensions used in test
    done();
  }, 0);
});
