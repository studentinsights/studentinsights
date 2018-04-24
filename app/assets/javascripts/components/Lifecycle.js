import React from 'react';
import PropTypes from 'prop-types';

// Wraps lifecycle events, so that a caller can
// describe imperative side-effecting actions based on when something
// is rendered, without having to put that inside the
// component definition.
//
// Example:
//   <Lifecycle componentWillMount={this.prefetchScreenTwoData}>
//     <ScreenOne />
//   </Lifecycle>
class Lifecycle extends React.Component {
  componentWillMount(nextProps, nextState) {
    const {componentWillMount} = this.props;
    if (componentWillMount) componentWillMount(nextProps, nextState);
  }

  render() {
    const {children} = this.props;
    return children;
  }  
}

Lifecycle.propTypes = {
  children: PropTypes.node.isRequired,
  componentWillMount: PropTypes.func
};

export default Lifecycle;