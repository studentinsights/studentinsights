import React from 'react';


// A higher-order component for measuring the mount timing of this
// component tree.  This measures the aggregate timing for 
// the tree.  Look at https://reactjs.org/docs/perf.html if you want
// more profiling data.
class MountTimer extends React.Component {
  constructor(props) {
    super(props);
    this.willMount = null;
    this.didMount = null;
  }

  componentWillMount() {
    this.willMount = performance.now();
  }

  componentDidMount() {
    const {onTiming} = this.props;
    this.didMount = performance.now();
    const diff = Math.round(this.didMount - this.willMount);

    if (onTiming) {
      onTiming(diff);
    } else if (process.env.NODE_ENV !== 'test') { // eslint-disable-line no-undef
      console.log('MountTimer: ', diff);  // eslint-disable-line no-console
    }
  }

  render() {
    const {children} = this.props;
    return children;
  }
}
MountTimer.propTypes = {
  children: React.PropTypes.node.isRequired,
  onTiming: React.PropTypes.func
};

export default MountTimer;