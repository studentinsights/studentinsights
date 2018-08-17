import {testProps, testRender, resetFetchMock, callUrls} from './SessionRenewal-One.test';


beforeEach(resetFetchMock);

it('after TIMED_OUT, shows message, signs out, and calls doNavigate', done => {
  const props = testProps();
  const el = testRender(props);

  setTimeout(() => {
    expect($(el).text()).toEqual('Your session has timed out due to inactivity.');
    expect(callUrls()).toContain('/educators/sign_out');
    expect(props.doNavigate).toHaveBeenCalled();
    done();
  }, 2500);
});
