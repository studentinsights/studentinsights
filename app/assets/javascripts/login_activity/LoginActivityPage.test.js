import React from 'react';
import ReactDOM from 'react-dom';
import fetchMock from 'fetch-mock/es5/client';
import LoginActivityPage from './LoginActivityPage';
import loginActivityJson from './loginActivityJson.fixture';

function mockFetch(props = {}) {
  fetchMock.restore();

  const {queryStartTimestamp, queryEndTimestamp} = props;
  const url = `/api/login_activity?created_at_or_before=${queryEndTimestamp}&created_after=${queryStartTimestamp}`;
  fetchMock.get(url, loginActivityJson);
}

function testProps(props = {}) {
  return {
    queryStartTimestamp: '1529513716',
    queryEndTimestamp: '1532105716',
    ...props
  };
}

it('renders without crashing', () => {
  const props = testProps();
  mockFetch(props);
  const el = document.createElement('div');
  ReactDOM.render(<LoginActivityPage {...props} />, el);
});

it('renders after fetching', done => {
  const props = testProps();
  mockFetch(props);
  const el = document.createElement('div');
  ReactDOM.render(<LoginActivityPage {...props} />, el);

  setTimeout(() => {
    expect(el.innerHTML).toContain('Login Attempts, Past 30 days');
    expect(el.querySelectorAll('div.tooltip').length).toEqual(47);
    done();
  }, 0);
});
