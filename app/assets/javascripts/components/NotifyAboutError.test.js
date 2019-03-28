import React from 'react';
import ReactDOM from 'react-dom';
import NotifyAboutError from './NotifyAboutError';

function testProps(props = {}) {
  return {
    rollbarErrorFn: jest.fn(),
    src: 'error in <Foo />',
    ...props
  };
}

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(<NotifyAboutError {...props} />, el);
}

it('renders without crashing', () => {
  testRender(testProps());
});

it('calls Rollbar.error', () => {
  const props = testProps();
  testRender(props);
  expect(props.rollbarErrorFn).toHaveBeenCalledWith('NotifyAboutError', {
    src: 'error in <Foo />'
  });
});
