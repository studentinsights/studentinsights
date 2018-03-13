import React from 'react';
import {toMomentFromTime} from '../../../app/assets/javascripts/helpers/toMoment';

// A container for testing that allows passing in a `nowFn`
// that will be shared with child components through context.
class NowContainer extends React.Component {
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
  nowFn: React.PropTypes.func
};
NowContainer.propTypes = {
  children: React.PropTypes.node.isRequired,
  nowFn: React.PropTypes.func.isRequired
};


// Helper to freeze the clock during tests
export function withNowContext(timeString, children) {
  const frozenNow = toMomentFromTime(timeString);
  return <NowContainer nowFn={() => frozenNow}>{children}</NowContainer>;
}

// Keep generic "now" value during most tests
export function withDefaultNowContext(children) {
  return withNowContext('2018-03-13T11:03:06.123Z', children);
}

export default NowContainer;