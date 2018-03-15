import React from 'react';
import ReactDOM from 'react-dom';
import Navbar from './Navbar';

it('renders without crashing', () => {
  const props = {
    districtwideAccess: false,
    schoolwideAccess: false,
    schoolId: null,
    gradeLevelAccess: []
  };
  const el = document.createElement('div');
  ReactDOM.render(<Navbar {...props} />, el);
});
