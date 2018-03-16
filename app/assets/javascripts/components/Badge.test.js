import React from 'react';
import ReactDOM from 'react-dom';
import Badge from './Badge';

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<Badge backgroundColor="black" text="hello" />, el);
  expect(el.innerHTML).toContain('hello');
});
