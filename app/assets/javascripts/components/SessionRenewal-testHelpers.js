import React from 'react';
import ReactDOM from 'react-dom';
import {withDefaultNowContext} from '../testing/NowContainer';
import SessionRenewal from './SessionRenewal';

export const TEST_DELAY = 300;

export function testProps(props = {}) {
  return {
    probeIntervalInSeconds: 0.1,
    warningDurationInSeconds: 5,
    forciblyClearPage: jest.fn(),
    warnFn: jest.fn(),
    updateAgressiveWarningFn: jest.fn(),
    ...props
  };
}

export function testRender(props = {}) {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<SessionRenewal {...props} />), el);
  return el;
}

export function callUrls(fetchMock) {
  const callUrls = fetchMock.calls().map(call => call[0]);
  return callUrls;
}
