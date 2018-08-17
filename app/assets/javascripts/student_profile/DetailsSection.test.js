import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import DetailsSection from './DetailsSection';


function testProps(props = {}) {
  return {
    title: 'foo title',
    anchorId: 'foo',
    className: 'FooClassName',
    children: <div>children are here!</div>,
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(<DetailsSection {...props} />, el);
});


it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(<DetailsSection {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});