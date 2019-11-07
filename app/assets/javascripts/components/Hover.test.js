import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import Hover from './Hover';

function testProps(props) {
  return {
    children: isHovering => `some text, rendered based on isHovering: ${isHovering}`,
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<Hover {...testProps()} />, el);
  expect(el.textContent).toContain('some text, rendered based on isHovering: false');
});

it('snapshots view', () => {
  const tree = renderer
    .create(<Hover {...testProps()} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});