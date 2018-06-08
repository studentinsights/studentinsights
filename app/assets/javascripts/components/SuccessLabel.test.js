import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import SuccessLabel from './SuccessLabel';

function testProps(props) {
  return {
    text: "submitted",
    style: {
      padding: 5
    },
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<SuccessLabel {...testProps()} />, el);
  expect(el.innerHTML).toContain('submitted');
});

it('snapshots view', () => {
  const tree = renderer
    .create(<SuccessLabel {...testProps()} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});