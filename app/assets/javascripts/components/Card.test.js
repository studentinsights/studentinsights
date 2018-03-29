import React from 'react';
import ReactDOM from 'react-dom';
import Card from './Card';

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<Card>foo</Card>, el);
});
