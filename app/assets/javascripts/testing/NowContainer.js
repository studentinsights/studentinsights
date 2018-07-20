import React from 'react';
import PropTypes from 'prop-types';
import {toMomentFromTime} from '../helpers/toMoment';


// A container for testing that allows passing in a `nowFn`
// that will be shared with child components through context.
//
// Note that `context` should be avoided in general, and that the API
// is changing in upcoming React releases: https://reactjs.org/docs/context.html
export default class NowContainer extends React.Component {
  getChildContext() {
    const {nowFn} = this.props;
    return {
      nowFn() { return nowFn(); }
    };
  }

  render() {
    const {children} = this.props;

    return children;
  }
}
NowContainer.childContextTypes = {
  nowFn: PropTypes.func
};
NowContainer.propTypes = {
  children: PropTypes.node.isRequired,
  nowFn: PropTypes.func.isRequired
};

export const TEST_TIME_STRING = '2018-03-13T11:03:06.123Z';

export function testTimeMoment() {
  return toMomentFromTime(TEST_TIME_STRING);
}

// For use with Enzyme's shallow renderer
export function testContext(options = {}) {
  const timeString = options.timeString || TEST_TIME_STRING;
  const nowMoment = options.nowMoment || toMomentFromTime(timeString);
  return {
    nowFn() { return nowMoment; }
  };
}

// Keep generic "now" value during most tests
export function withDefaultNowContext(children) {
  return withNowContext(TEST_TIME_STRING, children);
}

// Helper to freeze the clock during tests
export function withNowContext(timeString, children) {
  return withNowMoment(toMomentFromTime(timeString), children);
}

export function withNowMoment(nowMoment, children) {
  return (
    <NowContainer nowFn={() => nowMoment}>
      {children}
    </NowContainer>
  );
}
