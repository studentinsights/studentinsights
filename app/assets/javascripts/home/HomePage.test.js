import React from 'react';
import {shallow} from 'enzyme';
import HomePage from './HomePage';
import HomeFeed from './HomeFeed';
import HomeInsights from './HomeInsights';
import SectionHeading from '../components/SectionHeading';
import {testContext} from '../../../../spec/javascripts/support/NowContainer';

function testProps() {
  return {
    educatorId: 9999,
    inExperienceTeam: false
  };
}

it('shallow renders without crashing', () => {
  const props = testProps();
  const context = testContext();
  const wrapper = shallow(<HomePage {...props} />, {context});
  expect(wrapper.find('.HomePage').length).toEqual(1);
  expect(wrapper.find(SectionHeading).length).toEqual(2);
  expect(wrapper.contains(<HomeFeed educatorId={props.educatorId} />)).toEqual(true);
  expect(wrapper.contains(<HomeInsights educatorId={props.educatorId} inExperienceTeam={props.inExperienceTeam} />)).toEqual(true);
});
