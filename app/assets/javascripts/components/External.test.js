import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import External from './External';

function testProps(props) {
  return {
    href: 'https://example.com/hello',
    children: 'example.com',
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<External {...testProps()} />, el);
  expect(el.innerHTML).toContain('hello');
});

it('snapshots view', () => {
  const tree = renderer
    .create(<External {...testProps()} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});