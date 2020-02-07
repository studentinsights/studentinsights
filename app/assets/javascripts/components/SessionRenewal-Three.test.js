import fetchMock from 'fetch-mock/es5/client';
import {TEST_DELAY, testProps, testRender} from './SessionRenewal-testHelpers';

beforeEach(() => {
  fetchMock.reset();
  fetchMock.restore();
  fetchMock.get('/educators/reset', {});

  // This use of Response is not supported in target browsers, but is
  // supported in the test setup, so is fine for this smoke test.
  fetchMock.get('/educators/probe', new Response('{}', { status: 401 })); // eslint-disable-line compat/compat
});

it('if probe fails, calls forciblyClearPage', done => {
  const props = testProps();
  const el = testRender(props);

  setTimeout(() => {
    expect(props.forciblyClearPage).toHaveBeenCalled();
    expect(props.warnFn).toHaveBeenCalledWith('SessionRenewal-v4-forciblyClearPage', {});
    expect($(el).text()).toEqual('');
    done();
  }, TEST_DELAY);
});