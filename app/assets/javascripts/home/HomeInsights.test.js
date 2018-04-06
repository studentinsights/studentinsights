import React from 'react';
import {shallow} from 'enzyme';
import ReactDOM from 'react-dom';
import HomeInsights from './HomeInsights';
import CheckStudentsWithLowGrades from './CheckStudentsWithLowGrades';


function testProps(props = {}) {
  return {
    educatorId: 9999,
    educatorLabels: [],
    ...props
  };
}

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(<HomeInsights {...props} />, el);
});

it('shallow renders', () => {
  const props = testProps();
  const wrapper = shallow(<HomeInsights {...props} />);
  expect(wrapper.find(CheckStudentsWithLowGrades).length).toEqual(0);
});

it('shallow renders NGE/10GE box when labels include experience team', () => {
  const props = testProps({ educatorLabels: ['shs_experience_team'] });
  const wrapper = shallow(<HomeInsights {...props} />);
  expect(wrapper.contains(<CheckStudentsWithLowGrades educatorId={9999} />)).toEqual(true);
});