import React from 'react';
import {shallow} from 'enzyme';
import ReactDOM from 'react-dom';
import HomeInsights from './HomeInsights';
import CheckStudentsWithLowGrades from './CheckStudentsWithLowGrades';


function testProps(props = {}) {
  return {
    educatorId: 9999,
    inExperienceTeam: false,
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

it('shallow renders box when inExperienceTeam: true', () => {
  const props = testProps({ inExperienceTeam: true });
  const wrapper = shallow(<HomeInsights {...props} />);
  expect(wrapper.contains(<CheckStudentsWithLowGrades educatorId={props.educatorId} />)).toEqual(true);
});