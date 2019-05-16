import React from 'react';
import ReactDOM from 'react-dom';
import Quilts from './Quilts';

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<Quilts students={[]} />, el);
});
