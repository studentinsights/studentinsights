import React from 'react';
import PropTypes from 'prop-types';
import {apiFetchJson, signOut} from '../helpers/apiFetchJson';


// Show a warning that the user's session is likely to timeout shortly.
// This will be reset by Ajax calls or single-page navigation, so isn't entirely
// accurate and will warn a bit too aggressively.  But it will work well for full-page
// loads without other interactions.
export default class SessionRenewal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: States.ACTIVE
    };
    this.warningTimer = null;
    this.timeoutTimer = null;

    this.resetTimers = this.resetTimers.bind(this);
    this.onWarning = this.onWarning.bind(this);
    this.onTimeout = this.onTimeout.bind(this);
    this.onRenewClicked = this.onRenewClicked.bind(this);
    this.onRenewCompleted = this.onRenewCompleted.bind(this);
    this.doNavigateHome = this.doNavigateHome.bind(this);
  }

  // Provides a function for child components to reset session timers (eg, on xhr requests).
  getChildContext() {
    return {resetTimers: this.resetTimers};
  }

  componentDidMount() {
    this.resetTimers();
  }

  resetTimers() {
    const {warningTimeoutInSeconds, sessionTimeoutInSeconds} = this.props;
    if (this.warningTimer) clearTimeout(this.warningTimer);
    if (this.timeoutTimer) clearTimeout(this.timeoutTimer);

    this.warningTimer = setTimeout(this.onWarning, warningTimeoutInSeconds * 1000);
    this.timeoutTimer = setTimeout(this.onTimeout, sessionTimeoutInSeconds * 1000);
  }

  doNavigateHome() {
    window.location = '/';
  }

  onWarning() {
    this.setState({status: States.WARNING});
  }

  onTimeout() {
    this.setState({status: States.TIMED_OUT});
    signOut('/educators/sign_out')
      .then(r => this.doNavigateHome(r))
      .catch(e => this.doNavigateHome(e));
  }

  onError() {
    this.setState({status: States.ERROR});
    this.resetTimers();
    this.doNavigateHome();
  }

  onRenewClicked() {
    apiFetchJson('/educators/reset').then(this.onRenewCompleted);
  }

  onRenewCompleted(json) {
    if (json.status ==='ok') {
      this.resetTimers();
      this.setState({status: States.ACTIVE});
    } else {
      this.onError();  
    }
  }

  render() {
    const {status} = this.state;

    if (status === States.ACTIVE) return null;
    
    if (status === States.WARNING) return (
      <div style={styles.root}>
        Please click <a href="#" style={styles.link} onClick={this.onRenewClicked}>this link</a> or your session will timeout due to inactivity.
      </div>
    );

    if (status === States.TIMED_OUT) return (
      <div style={styles.root}>Your session has timed out due to inactivity.</div>
    );

    if (status === States.ERROR) return (
      <div style={styles.root}>Your session could not be renewed, please sign in again.</div>
    );
  }
}
SessionRenewal.childContextTypes = {
  resetTimers: PropTypes.func
};
SessionRenewal.propTypes = {
  warningTimeoutInSeconds: PropTypes.number.isRequired,
  sessionTimeoutInSeconds: PropTypes.number.isRequired
};

const styles = {
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4A90E2',
    color: 'white',
    textAlign: 'center',
    padding: 20
  },
  link: {
    color: 'white',
    textDecoration: 'underline',
    fontSize: 16
  }
};

const States = {
  ACTIVE: 'active',
  WARNING: 'warning',
  TIMED_OUT: 'timed_out'
};