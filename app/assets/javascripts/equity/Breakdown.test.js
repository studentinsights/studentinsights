import React from 'react';
import ReactDOM from 'react-dom';
import Breakdown from './Breakdown';

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<Breakdown students={[]} />, el);
});
