import React from 'react';
import PropTypes from 'prop-types';
import {toMomentFromTime} from '../../../app/assets/javascripts/helpers/toMoment';

// A container for testing that allows passing in a `nowFn`
// that will be shared with child components through context.
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
export const TEST_TIME_MOMENT = toMomentFromTime(TEST_TIME_STRING);

// For use with Enzyme's shallow renderer
export function testContext(options = {}) {
  const timeString = options.timeString || TEST_TIME_STRING;
  return {
    nowFn() { return toMomentFromTime(timeString); }
  };
}

// Helper to freeze the clock during tests
export function withNowContext(timeString, children) {
  return (
    <NowContainer nowFn={() => toMomentFromTime(timeString)}>
      {children}
    </NowContainer>
  );
}

// Keep generic "now" value during most tests
export function withDefaultNowContext(children) {
  return withNowContext(TEST_TIME_STRING, children);
}
