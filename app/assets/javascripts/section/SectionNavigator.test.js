import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from 'enzyme';
import Select from 'react-select';
import SectionNavigator from './SectionNavigator';
import sectionJson from './sectionJson.fixture';

function testProps(props = {}) {
  return {
    sections: sectionJson.sections,
    ...props
  };
}

function testRender(props = {}, context = {}) {
  const el = document.createElement('div');
  ReactDOM.render(<SectionNavigator {...props} />, el);
  return {el};
}

it('renders without crashing', () => {
  const props = testProps();
  const {el} = testRender(props);
  expect($(el).html()).toContain('Find section...');
  expect($(el).html()).toContain('button');
});

it('passes options to Select, sorted and formatted as expected', () => {
  const props = testProps();
  const wrapper = mount(<SectionNavigator {...props} />);
  expect(wrapper.find(Select).props().options).toEqual([
    { value: 3, "label": "ART MAJOR FOUNDATIONS (ART-302A)" },
    { value: 4, "label": "ART MAJOR FOUNDATIONS (ART-302B)" }
  ]);
});
