import React from 'react';
import {mount} from 'enzyme';
import GenericLoader from './GenericLoader';

function testProps(props = {}) {
  return {
    promiseFn() { return Promise.resolve({ foo: 'bar' }); },
    render(data) { return <div>{data.foo}</div>; },
    ...props 
  };
}

it('renders when pending', () => {
  const props = testProps();
  const wrapper = mount(<GenericLoader {...props} />);
  expect(wrapper.html()).toContain('Loading...');
});

it('renders when resolved', () => {
  const props = testProps();
  const wrapper = mount(<GenericLoader {...props} />);
  setTimeout(() => expect(wrapper.html()).toContain('bar'), 0);
});


// This code behaves differently in different environments.  In test
// mode we want rejections to raise so we get the full stack trace,
// but in development or production we want it handle rejections
// gracefully.
describe('when not GENERIC_LOADER_THROW_ON_REJECT_IN_TEST', () => {
  // This has to temporarily remove the Jest setup code 
  // that fails the test when console.error is triggered, and
  // disable throwing
  var consoleError = null; // eslint-disable-line no-var
  var genericLoaderFlag = null; // eslint-disable-line no-var
  beforeEach(() => {
    consoleError = console.error; // eslint-disable-line no-console
    console.error = jest.fn(); // eslint-disable-line no-console
    genericLoaderFlag = window.GENERIC_LOADER_THROW_ON_REJECT_IN_TEST;
    delete window.GENERIC_LOADER_THROW_ON_REJECT_IN_TEST;
  });
  afterEach(() => {
    console.error = consoleError; // eslint-disable-line no-console
    window.GENERIC_LOADER_THROW_ON_REJECT_IN_TEST = genericLoaderFlag;
  });
  
  it('renders error message on rejection', done => {
    const props = testProps({
      promiseFn() { return Promise.reject({ err: 'nooo' }); }
    });
    const wrapper = mount(<GenericLoader {...props} />);
    setTimeout(() => {
      expect(wrapper.html()).toContain('There was an error loading this data.');
      done();
    }, 0);
  });
});