import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import DibelsBreakdownBar from './DibelsBreakdownBar';


export function testProps(props) {
  return {
    coreCount: 7,
    strategicCount: 3,
    intensiveCount: 2,
    height: 50,
    labelTop: 55,
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(<DibelsBreakdownBar {...props} />, el);
});

it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(<DibelsBreakdownBar {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});