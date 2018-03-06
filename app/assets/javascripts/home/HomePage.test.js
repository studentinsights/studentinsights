import React from 'react';
import ReactDOM from 'react-dom';
import fetchMock from 'fetch-mock/es5/client';
import HomePage from './HomePage';
import homeFeedJson from '../../../../spec/javascripts/fixtures/home_feed_json';
import unsupportedLowGradesJson from '../../../../spec/javascripts/fixtures/home_unsupported_low_grades_json';

it('renders without crashing', () => {
  fetchMock.get('/home/feed_json?limit=20', homeFeedJson);
  fetchMock.get('/home/unsupported_low_grades_json', unsupportedLowGradesJson);
  const div = document.createElement('div');
  ReactDOM.render(<HomePage />, div);
});