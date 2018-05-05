import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import Stack from './Stack';


export function testProps(props) {
  return {
    stacks: [
      {count: 18, color: 'red'},
      {count: 8, color: 'orange'}
    ],
    scaleFn(count) { return count / (18+8); },
    labelFn(count) { return count; },
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(<Stack {...props} />, el);
});

it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(<Stack {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});