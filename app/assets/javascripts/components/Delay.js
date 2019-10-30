import React from 'react';
import PropTypes from 'prop-types';


// Delay rendering of child components with a timer
// Adapted from https://github.com/chrisshiplet/react-delay
class Delay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      waiting: true
    };
    this.onDelayDone = this.onDelayDone.bind(this);
  }

  componentDidMount() {
    this.timer = setTimeout(this.onDelayDone, this.props.wait);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  onDelayDone() {
    const {onDone} = this.props;
    this.setState({ waiting: false }, () => {
      if (onDone) onDone();
    });
  }

  render() {
    const {children, placeholder} = this.props;
    const {waiting} = this.state;
    if (!waiting) {
      return children;
    }

    return placeholder;
  }
}

Delay.propTypes = {
  children: PropTypes.node.isRequired,
  wait: PropTypes.number.isRequired,
  placeholder: PropTypes.node,
  onDone: PropTypes.func
};

Delay.defaultProps = {
  wait: 250,
  placeholder: null
};

export default Delay;