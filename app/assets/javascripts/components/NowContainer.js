import React from 'react';

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
  nowFn: React.PropTypes.func
};
NowContainer.propTypes = {
  children: React.PropTypes.node.isRequired,
  nowFn: React.PropTypes.func.isRequired
};