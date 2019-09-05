import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from 'enzyme';
import Select from 'react-select';
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

it('passes options to Select, sorted and formatted as expected', () => {
  const props = testProps();
  const wrapper = mount(<HomeroomNavigator {...props} />);
  expect(wrapper.find(Select).props().options).toEqual([
    { value: 101, label: 'HEA 003 (KF)' },
    { value: 2, label: 'HEA 500 (5)' },
    { value: 105, label: 'WSNS 501 (5)' },
    { value: 102, label: 'SHS 917 (9)' },
    { value: 103, label: 'SHS 942 (9)' },
    { value: 104, label: 'SHS ALL (mixed)' }
  ]);
});
