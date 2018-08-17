import ReactTestUtils from 'react-addons-test-utils';
import {testProps, testRender, resetFetchMock, callUrls} from './SessionRenewal-One.test';

// This is split out as a separate file, since using fetchMock in the same file leads to pollution
// across tests that are run in parallel.
it('when renew is clicked, makes HTTP request to renew', done => {
  resetFetchMock();
  const props = testProps();
  const el = testRender(props);
  setTimeout(() => {
    expect($(el).text()).toEqual('Please click this link or your session will timeout due to inactivity.');
    ReactTestUtils.Simulate.click($(el).find('a').get(0));
    expect(callUrls(props.fetch)).toContain('/educators/reset');
    done();
  }, 1500);  
}); 
