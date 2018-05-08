import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import BreakdownBar from './BreakdownBar';


export function testProps(props) {
  return {
    items: [
      { left: 0, width: 7, color: 'green', key: 'core' },
      { left: 7, width: 2, color: 'orange', key: 'strategic' },
      { left: 7 + 2, width: 3, color: 'red', key: 'intensive' }
    ],
    height: 50,
    labelTop: 55,
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(<BreakdownBar {...props} />, el);
});

it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(<BreakdownBar {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});