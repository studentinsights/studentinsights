import React from 'react';
import ReactDOM from 'react-dom';
import {withDefaultNowContext} from '../testing/NowContainer';
import fetchMock from 'fetch-mock/es5/client';
import TieringPage from './TieringPage';
import tieringShowJson from './tieringShowJson.fixture';

function testProps(props = {}) {
  return {
    schoolId: 'shs',
    ...props
  };
}

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/tiering/shs/show_json', tieringShowJson);
});

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(
    <TieringPage {...props} />
  ), el);
});

it('renders everything after fetch', done => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(
    <TieringPage {...props} />
  ), el);
  expect($(el).text()).toContain('HS Levels: v1 prototype');

  setTimeout(() => {
    expect($(el).find('.TieringView').length).toEqual(1);
    done();
  }, 0);
});
