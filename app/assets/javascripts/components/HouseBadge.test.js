import React from 'react';
import ReactDOM from 'react-dom';
import HouseBadge from './HouseBadge';

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<HouseBadge house="Beacon" />, el);
});
