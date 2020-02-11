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
    const debugKey = this.props.debugKey || '(default)';
    const errorMessage = (error && error.message) ? error.message : '(missing)';
    const msg = `RollbarErrorBoundary#componentDidCatch for debugKey=${debugKey}, error.message=${errorMessage}`;

    // Pass `error` as its own value, because of quirks in JS `Error` types
    // (see below).
    this.rollbarErrorFn(msg, error, {info, debugKey});
  }

  // It's important that `Error` objects are passed as their own argument to Rollbar,
  // and not as part of another object, since their properties aren't enumerable, and
  // they therefore won't be serialized.  See 
  // Read more at https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
  rollbarErrorFn(msg, ...params) {
    if (this.props.rollbarErrorFn) return this.props.rollbarErrorFn(msg, ...params);
    if (window.Rollbar && window.Rollbar.error) return window.Rollbar.error(msg, ...params);
    console.error('RollbarErrorBoundary#rollbarErrorFn could not find function for reporting error:', msg, ...params); // eslint-disable-line no-console
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
  rollbarErrorFn: PropTypes.func,
  debugKey: PropTypes.string
};