import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import Badge from './Badge';

function testProps(props) {
  return {
    backgroundColor: "black",
    text: "hello",
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<Badge {...testProps()} />, el);
  expect(el.innerHTML).toContain('hello');
});

it('snapshots view', () => {
  const tree = renderer
    .create(<Badge {...testProps()} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});