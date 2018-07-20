import React from 'react';
import ReactDOM from 'react-dom';
import LoginActivityPage from './LoginActivityPage';
import fetchMock from 'fetch-mock/es5/client';

it('renders without crashing', () => {
  fetchMock.restore();
  fetchMock.get(
    '/api/login_activity?created_at_or_before=1532105716&created_after=1529513716',
    '[]'
  );

  const el = document.createElement('div');
  ReactDOM.render(
    <LoginActivityPage
      queryStartTimestamp={'1529513716'}
      queryEndTimestamp={'1532105716'} />, el);
});
