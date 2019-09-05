import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import HomeroomNavigator from './HomeroomNavigator';
import homeroomJson from './homeroomJson.fixture';

function testProps(props = {}) {
  return {
    homerooms: homeroomJson.homerooms,
    ...props
  };
}

function testRender(props = {}, context = {}) {
  const el = document.createElement('div');
  ReactDOM.render(<HomeroomNavigator {...props} />, el);
  return {el};
}

it('renders without crashing', () => {
  const props = testProps();
  const {el} = testRender(props);
  expect($(el).html()).toContain('Find homeroom...');
  expect($(el).html()).toContain('button');
});

it('snapshots view', () => {
  const props = testProps();
  const tree = renderer
    .create(<HomeroomNavigator {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});