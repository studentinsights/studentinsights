import React from 'react';
import ReactDOM from 'react-dom';
import RailsLinkMethod from './RailsLinkMethod';

it('renders without crashing', () => {
  const props = {
    href: '/foo',
    method: 'delete'
  };
  const el = document.createElement('div');
  ReactDOM.render(<RailsLinkMethod {...props}>sign out</RailsLinkMethod>, el);
});
