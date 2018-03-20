import React from 'react';
import ReactDOM from 'react-dom';
import ExperimentalBanner from './ExperimentalBanner';

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<ExperimentalBanner />, el);
});
