import React from 'react';
import ReactDOM from 'react-dom';
import School from './School';

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<School id={42} name="Somerville High School" />, el);
});
