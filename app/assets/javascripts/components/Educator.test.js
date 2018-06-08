import React from 'react';
import ReactDOM from 'react-dom';
import Educator from './Educator';

it('renders without crashing', () => {
  const educator = {
    full_name: 'Han Kenobi',
    email: 'han@demo.studentinsights.org'
  };
  const el = document.createElement('div');
  ReactDOM.render(<Educator educator={educator} />, el);
});
