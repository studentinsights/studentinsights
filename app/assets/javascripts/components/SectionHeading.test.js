import React from 'react';
import ReactDOM from 'react-dom';
import SectionHeading from './SectionHeading';

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<SectionHeading>foo</SectionHeading>, el);
});
