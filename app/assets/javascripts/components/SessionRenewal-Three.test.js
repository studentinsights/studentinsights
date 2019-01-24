import {testProps, testRender, resetFetchMock} from './SessionRenewal-One.test';

// TODO(kr)
function disabledTests() { // eslint-disable-line
  beforeEach(resetFetchMock);

  it('after TIMED_OUT, shows message, signs out, and calls forceReload', done => {
    const props = testProps();
    const el = testRender(props);

    setTimeout(() => {
      expect($(el).text()).toEqual('Your session has timed out due to inactivity.');
      expect(props.forceReload).toHaveBeenCalled();
      done();
    }, 2500);
  });
}