import React from 'react';
import {mount} from 'enzyme';
import WarnBeforeUnload from './WarnBeforeUnload';

function renderWithSpies(props) {
  const addEventListener = jest.spyOn(window, 'addEventListener');
  const wrapper = mount(<WarnBeforeUnload {...props}><div>hello</div></WarnBeforeUnload>);
  const onBeforeUnload = jest.spyOn(wrapper.instance(), 'onBeforeUnload');
  return {addEventListener, wrapper, onBeforeUnload};
}

it('renders without crashing', () => {
  const {wrapper} = renderWithSpies({ messageFn: () => null });
  expect(wrapper.text()).toEqual('hello');
});

it('adds an event listener', () => {
  const {addEventListener} = renderWithSpies({ messageFn: () => null });
  expect(addEventListener).toHaveBeenCalled();
});

it('sets no message when undefined', () => {
  const {addEventListener, wrapper, onBeforeUnload} = renderWithSpies({ messageFn: () => null });
  expect(addEventListener).toHaveBeenCalled();

  const event = {};
  wrapper.instance().onBeforeUnload(event);
  expect(onBeforeUnload.mock.calls.length).toEqual(1);
  expect(event).toEqual({});
});

it('can set message to prevent navigation', () => {
  const {addEventListener, wrapper, onBeforeUnload} = renderWithSpies({ messageFn: () => 'no, please!!' });
  expect(addEventListener).toHaveBeenCalled();

  const event = {};
  wrapper.instance().onBeforeUnload(event);
  expect(onBeforeUnload.mock.calls.length).toEqual(1);
  expect(event).toEqual({"returnValue": "no, please!!"});
});
