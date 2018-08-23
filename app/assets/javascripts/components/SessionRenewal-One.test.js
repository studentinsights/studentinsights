import React from 'react';
import ReactDOM from 'react-dom';
import {withDefaultNowContext} from '../testing/NowContainer';
import fetchMock from 'fetch-mock/es5/client';
import SessionRenewal from './SessionRenewal';


export function testProps(props = {}) {
  return {
    sessionTimeoutInSeconds: 2,
    warningTimeoutInSeconds: 1,
    forceReload: jest.fn(),
    ...props
  };
}

export function testRender(props = {}) {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<SessionRenewal {...props} />), el);
  return el;
}

export function resetFetchMock() {
  fetchMock.reset();
  fetchMock.restore();
  fetchMock.get('/educators/reset', {});
}

export function callUrls() {
  const callUrls = fetchMock.calls().map(call => call[0]);
  return callUrls;
}


// These tests are split across files, since using fetchMock in the same file leads to pollution
// across tests that are run in parallel.
beforeEach(resetFetchMock);

it('renders without crashing', () => {
  testRender(testProps());
});

it('when ACTIVE, renders nothing', () => {
  const props = testProps();
  const el = testRender(props);
  expect($(el).text()).toEqual('');
});

it('after WARNING timeout, shows message', done => {
  const props = testProps();
  const el = testRender(props);

  setTimeout(() => {
    expect($(el).text()).toEqual('Please click this link or your session will timeout due to inactivity.');
    done();
  }, 1500);
});
