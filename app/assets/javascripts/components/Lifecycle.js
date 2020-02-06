import React from 'react';
import PropTypes from 'prop-types';

// Wraps lifecycle events, so that a caller can
// describe imperative side-effecting actions based on when something
// is rendered, without having to put that inside the
// component definition.
//
// Example:
//   <Lifecycle componentDidMount={this.prefetchScreenTwoData}>
//     <ScreenOne />
//   </Lifecycle>
export default class Lifecycle extends React.Component {
  componentDidMount(nextProps, nextState) {
    const {componentDidMount} = this.props;
    if (componentDidMount) componentDidMount(nextProps, nextState);
  }

  render() {
    const {children} = this.props;
    return children;
  }  
}

Lifecycle.propTypes = {
  children: PropTypes.node.isRequired,
  componentDidMount: PropTypes.func
};
