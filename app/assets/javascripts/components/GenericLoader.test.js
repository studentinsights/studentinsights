import React from 'react';
import ReactDOM from 'react-dom';
import GenericLoader from './GenericLoader';

function testProps(props = {}) {
  return {
    promiseFn() { return Promise.resolve({ foo: 'bar' }); },
    render(data) { return <div>{data.foo}</div>; },
    ...props 
  };
}

it('renders when pending', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(<GenericLoader {...props} />, el);
  expect(el.innerHTML).toContain('Loading...');
});

it('renders when resolved', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(<GenericLoader {...props} />, el);
  setTimeout(() => expect(el.innerHTML).toContain('bar'), 0);
});

it('renders when rejected', () => {
  const props = testProps({
    promiseFn() { return Promise.reject({ err: 'nooo' }); }
  });
  const el = document.createElement('div');
  ReactDOM.render(<GenericLoader {...props} />, el);
  setTimeout(() => expect(el.innerHTML).toContain('There was an error loading this data.'), 0);
});