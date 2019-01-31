import fetchMock from 'fetch-mock/es5/client';
import {TEST_DELAY, testProps, testRender} from './SessionRenewal-testHelpers';

beforeEach(() => {
  fetchMock.reset();
  fetchMock.restore();
  fetchMock.get('/educators/reset', {});
  fetchMock.get('/educators/probe', new Response('{}', {
    status: 401
  }));
});

it('if probe fails, calls forciblyClearPage', done => {
  const props = testProps();
  const el = testRender(props);

  setTimeout(() => {
    expect(props.forciblyClearPage).toHaveBeenCalled();
    expect(props.warnFn).toHaveBeenCalledWith('SessionRenewal-v3-forciblyClearPage', {});
    expect($(el).text()).toEqual('');
    done();
  }, TEST_DELAY);
});