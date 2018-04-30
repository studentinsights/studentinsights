import React from 'react';
import ReactDOM from 'react-dom';
import DesignChangesBanner from './DesignChangesBanner';

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<DesignChangesBanner />, el);
});
