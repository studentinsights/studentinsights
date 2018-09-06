import React from 'react';
import {shallow} from 'enzyme';
import ReactDOM from 'react-dom';
import HomeInsights from './HomeInsights';
import CheckStudentsWithLowGrades from './CheckStudentsWithLowGrades';
import CheckStudentsWithHighAbsences from './CheckStudentsWithHighAbsences';

function testProps(props = {}) {
  return {
    educatorId: 9999,
    educatorLabels: [],
    ...props
  };
}

jest.mock('./CheckStudentsWithLowGrades');
jest.mock('./CheckStudentsWithHighAbsences');

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(<HomeInsights {...props} />, el);
});

it('shallow renders', () => {
  const props = testProps();
  const wrapper = shallow(<HomeInsights {...props} />);
  expect(wrapper.contains(<CheckStudentsWithHighAbsences educatorId={9999} />)).toEqual(true);
  expect(wrapper.find(CheckStudentsWithLowGrades).length).toEqual(0);
});

it('shallow renders low grades box when correct label is set', () => {
  const props = testProps({ educatorLabels: ['should_show_low_grades_box'] });
  const wrapper = shallow(<HomeInsights {...props} />);
  expect(wrapper.contains(<CheckStudentsWithLowGrades educatorId={9999} />)).toEqual(true);
});