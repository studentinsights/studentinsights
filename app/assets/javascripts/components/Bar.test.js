import React from 'react';
import ReactDOM from 'react-dom';
import Bar from './Bar';

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<Bar percent={11} threshold={10} />, el);
});
