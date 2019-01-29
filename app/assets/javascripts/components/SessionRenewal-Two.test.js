import ReactTestUtils from 'react-addons-test-utils';
import fetchMock from 'fetch-mock/es5/client';
import {TEST_DELAY, testProps, testRender, callUrls} from './SessionRenewal-testHelpers';

// This is split out as a separate file, since using fetchMock in the same file leads to pollution
// across tests that are run in parallel.
beforeEach(() => {
  fetchMock.reset();
  fetchMock.restore();
  fetchMock.get('/educators/reset', {});
  fetchMock.get('/educators/probe', { remaining_seconds: 3 });
});

it('when renew is clicked, makes HTTP request to renew', done => {  
  const props = testProps();
  const el = testRender(props);
  setTimeout(() => {
    expect($(el).text()).toEqual('Please click this link or your session will timeout due to inactivity.');
    ReactTestUtils.Simulate.click($(el).find('a').get(0));
    expect(callUrls(fetchMock)).toContain('/educators/reset');
    expect(props.warnFn).toHaveBeenCalledWith('SessionRenewal#onRenewClicked');
    done();
  }, TEST_DELAY);  
}); 