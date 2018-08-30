import React from 'react';
import ReactDOM from 'react-dom';
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
