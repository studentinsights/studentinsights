import React from 'react';
import ReactDOM from 'react-dom';
import Autosaver from './Autosaver';


export function testProps(props) {
  return {
    readSnapshotFn() {
      return { foo: 'bar' };
    },
    doSaveFn() {
      return Promise.resolve({ foo: 'bazzzzz-updated'});
    },
    autoSaveIntervalMs: 300,
    ...props
  };
}


it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(
    <Autosaver {...props}>
      <div>hello!</div>
    </Autosaver>
  , el);
});
