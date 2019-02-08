import fetchMock from 'fetch-mock/es5/client';
import {TEST_DELAY, testProps, testRender} from './SessionRenewal-testHelpers';
import {shouldWarn} from './SessionRenewal';


// These tests are split across files, since using fetchMock in the same file leads to pollution
// across tests that are run in parallel.
beforeEach(() => {
  fetchMock.reset();
  fetchMock.restore();
  fetchMock.get('/educators/reset', {});
});

it('renders without crashing', () => {
  testRender(testProps());
});

it('normally renders nothing', () => {
  const props = testProps();
  const el = testRender(props);
  expect($(el).text()).toEqual('');
});

it('shows warning message', done => {
  fetchMock.get('/educators/probe', { remaining_seconds: 3 });
  const props = testProps();
  const el = testRender(props);

  setTimeout(() => {
    expect($(el).text()).toEqual('Please click this link or your session will timeout due to inactivity.');
    done();
  }, TEST_DELAY);
});

it('does not show warning message', done => {
  fetchMock.get('/educators/probe', { remaining_seconds: 7 });
  const props = testProps();
  const el = testRender(props);

  setTimeout(() => {
    expect($(el).text()).toEqual('');
    done();
  }, TEST_DELAY);
});

it('shouldWarn', () => {
  expect(shouldWarn(120, 60, 30)).toEqual(false);
  expect(shouldWarn(91, 60, 30)).toEqual(false);
  expect(shouldWarn(90, 60, 30)).toEqual(true);
  expect(shouldWarn(60, 60, 30)).toEqual(true);
  expect(shouldWarn(30, 60, 30)).toEqual(true);
});