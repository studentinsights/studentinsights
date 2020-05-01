import React from 'react';
import ReactDOM from 'react-dom';
import Lifecycle from './Lifecycle.js';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Lifecycle><div>hello</div></Lifecycle>, div);
});


it('calls componentWillMount', () => {
  const div = document.createElement('div');
  const props = {
    componentWillMount: jest.fn()
  };
  ReactDOM.render(<Lifecycle {...props}><div>hello</div></Lifecycle>, div);
  expect(props.componentWillMount).toHaveBeenCalled();
});

it('calls componentWillUnmount', () => {
  const div = document.createElement('div');
  const props = {
    componentWillUnmount: jest.fn()
  };
  ReactDOM.render(<Lifecycle {...props}><div>hello</div></Lifecycle>, div);
  expect(props.componentWillUnmount).not.toHaveBeenCalled();
  ReactDOM.render(<b>goodbye</b>, div);
  expect(props.componentWillUnmount).toHaveBeenCalled();
});
