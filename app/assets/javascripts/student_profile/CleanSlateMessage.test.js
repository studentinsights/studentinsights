import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import CleanSlateMessage from './CleanSlateMessage';
import {withDefaultNowContext} from '../testing/NowContainer';


function testProps(props = {}) {
  return {
    canViewFullHistory: false,
    isViewingFullHistory: false,
    onToggleVisibility: jest.fn(),
    xAmountOfDataText: 'two years of data',
    ...props
  };
}

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<CleanSlateMessage {...props} />), el);
  return el;
}

it('renders empty data without crashing', () => {
  testRender(testProps());
});

it('renders note when cannot access', () => {
  const el = testRender(testProps());
  expect($(el).text()).toContain('talk with an administrator');
});

it('renders note to show full case history when access', () => {
  const el = testRender(testProps({canViewFullHistory: true}));
  expect($(el).text()).toContain('show full case history');
});

it('allows showing older data when access', () => {
  const props = testProps({canViewFullHistory: true});
  const el = testRender(props);
  expect($(el).text()).toContain('show full case history');
  ReactTestUtils.Simulate.click($(el).find('a').get(0));
  expect(props.onToggleVisibility).toHaveBeenCalled();
});

it('allows hiding older data when access', () => {
  const props = testProps({
    canViewFullHistory: true,
    isViewingFullHistory: true
  });
  const el = testRender(props);
  expect($(el).text()).toContain('hide full case history');
  ReactTestUtils.Simulate.click($(el).find('a').get(0));
  expect(props.onToggleVisibility).toHaveBeenCalled();
});
