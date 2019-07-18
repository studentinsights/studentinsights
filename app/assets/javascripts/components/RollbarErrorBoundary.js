import React from 'react';
import PropTypes from 'prop-types';
import {HelpEmail} from '../components/PublicLinks';


// Provide an error boundary, reporting to Rollbar if this happens.
// Requires window.Rollbar.error to be present.
export default class RollbarErrorBoundary extends React.Component {
  static getDerivedStateFromError(error, info) {
    return {error, info};
  }

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      info: null
    };

    this.rollbarErrorFn = this.rollbarErrorFn.bind(this);
  }

  componentDidCatch(error, info) {
    this.rollbarErrorFn('RollbarErrorBoundary#componentDidCatch', {error, info});
  }

  rollbarErrorFn(msg, obj = {}) {
    if (this.props.rollbarErrorFn) return this.props.rollbarErrorFn(msg, obj);
    if (window.Rollbar.error) return window.Rollbar.error(msg, obj);
    console.error('RollbarErrorBoundary#rollbarErrorFn could not find function for reporting error:', msg, obj);
  }

  render() {
    const {error, info} = this.state;
    if (error || info) {
      return (
        <div style={{margin: 20, backgroundColor: '#ff9b00', padding: 10, fontSize: 14}}>
          <div style={{fontWeight: 'bold'}}>There was an error on the page.</div>
          <div style={{marginTop: 10}}>An error notification has been sent automatically, but if you need help right away please reach out to <HelpEmail style={{fontWeight: 'bold'}} />.</div>
        </div>
      );
    }

    return this.props.children;
  }
}
RollbarErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  rollbarErrorFn: PropTypes.func
};