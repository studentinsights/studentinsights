import React from 'react';
import {shallow} from 'enzyme';
import HomePage from './HomePage';
import HomeFeed from './HomeFeed';
import HomeInsights from './HomeInsights';
import SectionHeading from '../components/SectionHeading';
import {testContext} from '../testing/NowContainer';

function testProps(props = {}) {
  return {
    educatorId: 9999,
    educatorLabels: ['foo'],
    ...props
  };
}

it('shallow renders without crashing', () => {
  const props = testProps();
  const context = testContext();
  const wrapper = shallow(<HomePage {...props} />, {context});
  expect(wrapper.find('.HomePage').length).toEqual(1);
  expect(wrapper.find(SectionHeading).length).toEqual(2);
  expect(wrapper.contains(<HomeFeed educatorId={9999} />)).toEqual(true);
  expect(wrapper.contains(<HomeInsights educatorId={9999} educatorLabels={['foo']} />)).toEqual(true);
});


it('does not show search', () => {
  const props = testProps();
  const context = testContext();
  const wrapper = shallow(<HomePage {...props} />, {context});
  expect(wrapper.find('.HomePage').length).toEqual(1);
  expect(wrapper.find(SectionHeading).length).toEqual(2);
  expect(wrapper.contains('Search notes')).toEqual(false);
});


it('can show search for `enable_searching_notes`', () => {
  const props = testProps({educatorLabels: ['enable_searching_notes']});
  const context = testContext();
  const wrapper = shallow(<HomePage {...props} />, {context});
  expect(wrapper.find('.HomePage').length).toEqual(1);
  expect(wrapper.find(SectionHeading).length).toEqual(2);
  expect(wrapper.contains('Search notes')).toEqual(true);
});
