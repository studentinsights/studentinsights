import React from 'react';
import ReactDOM from 'react-dom';
import PromiseLoader from './PromiseLoader';

function rejectingFn() { return Promise.reject({ err: 'nooo' }); }
function resolvingFn() { return Promise.resolve({ foo: 'bar' }); }
function createChildren() {
  const children = jest.fn();
  children.mockReturnValue(<div>rendered!</div>);
  return children;
}

it('renders when pending', () => {
  const children = createChildren();
  const el = document.createElement('div');
  ReactDOM.render(
    <PromiseLoader promiseFn={rejectingFn}>
      {children}
    </PromiseLoader>
  , el);
  expect(children).toHaveBeenCalledWith({
    isPending: true,
    reject: undefined,
    resolve: undefined
  });
});

it('renders when resolved', () => {
  const children = createChildren();
  const el = document.createElement('div');
  ReactDOM.render(
    <PromiseLoader promiseFn={resolvingFn}>
      {children}
    </PromiseLoader>
  , el);
  expect(children).toHaveBeenCalledWith({
    isPending: true,
    reject: undefined,
    resolve: undefined
  });
  setTimeout(() => {
    expect(children).toHaveBeenCalledWith({
      isPending: true,
      reject: undefined,
      resolve: undefined
    });
  }, 0);
});

it('renders when rejected', () => {
  const children = createChildren();
  const el = document.createElement('div');
  ReactDOM.render(
    <PromiseLoader promiseFn={rejectingFn}>
      {children}
    </PromiseLoader>
  , el);
  expect(children).toHaveBeenCalledWith({
    isPending: true,
    reject: undefined,
    resolve: undefined
  });
  setTimeout(() => {
    expect(children).toHaveBeenCalledWith({
      isPending: false,
      reject: undefined,
      resolve: undefined
    });
  });
});