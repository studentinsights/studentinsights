import React from 'react';
import PropTypes from 'prop-types';

// Wrapping on `beforeunload` event.
export default class WarnBeforeUnload extends React.Component {
  constructor(props) {
    super(props);
    this.onBeforeUnload = this.onBeforeUnload.bind(this);
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.onBeforeUnload);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onBeforeUnload);
  }

  onBeforeUnload(event) {
    const {messageFn} = this.props;
    const warningMessage = messageFn();
    if (warningMessage === null || warningMessage === undefined) return undefined;

    // Chrome expects the event property to be mutated, other browsers
    // expect the function to return a value;
    event.returnValue = warningMessage; 
    return warningMessage;
  }

  render() {
    const {children} = this.props;
    return children;
  }
}
WarnBeforeUnload.propTypes = {
  messageFn: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};