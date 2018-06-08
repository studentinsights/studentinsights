import React from 'react';
import ReactDOM from 'react-dom';
import Homeroom from './Homeroom';

it('renders without crashing', () => {
  const props = {
    id: 4,
    name: 'Homeroom 321',
    educator: {
      full_name: 'Han Kenobi',
      email: 'han@demo.studentinsights.org'
    }
  };
  const el = document.createElement('div');
  ReactDOM.render(<Homeroom {...props} />, el);
});
