import React from 'react';
import ReactDOM from 'react-dom';
import MountTimer from './MountTimer';

it('renders without crashing', () => {
  const props = {
    onTiming: jest.fn()
  };
  const el = document.createElement('div');
  ReactDOM.render(<MountTimer {...props}><div>hello!</div></MountTimer>, el);
  expect(props.onTiming).toHaveBeenCalled();
});
