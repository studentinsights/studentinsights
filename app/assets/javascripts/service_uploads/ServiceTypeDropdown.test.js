import React from 'react';
import ReactDOM from 'react-dom';
import ServiceTypeDropdown from './ServiceTypeDropdown';

describe('data', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');

    ReactDOM.render(
      <ServiceTypeDropdown
        onUserTypingServiceType={jest.fn()}
        onUserSelectServiceType={jest.fn()}
        value={'Valuable Service'}
      />, div);
  });
});
