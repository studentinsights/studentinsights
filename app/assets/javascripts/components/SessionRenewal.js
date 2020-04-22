import React from 'react';
import PropTypes from 'prop-types';
import {apiFetch, apiFetchJson} from '../helpers/apiFetchJson';
import Lifecycle from '../components/Lifecycle';


// Show a warning that the user's session is likely to timeout shortly.
// This will be reset by Ajax calls or single-page navigation, so isn't entirely
// accurate and will warn a bit too aggressively.  But it will work well for full-page
// loads without other interactions.
export default class SessionRenewal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      probeJson: null,
      shouldShowError: false
    };
    this.probeInterval = null;

    this.onProbeInterval = this.onProbeInterval.bind(this);
    this.onProbed = this.onProbed.bind(this);
    this.onProbeRequestFailed = this.onProbeRequestFailed.bind(this);
    this.onRenewClicked = this.onRenewClicked.bind(this);
    this.onRenewCompleted = this.onRenewCompleted.bind(this);
    this.onRenewFailed = this.onRenewFailed.bind(this);
  }

  componentDidMount() {
    this.startProbeInterval();
  }

  componentWillUnmount() {
    this.stopProbeInterval();
  }

  startProbeInterval() {
    const {probeIntervalInSeconds} = this.props;
    this.probeInterval = setInterval(this.onProbeInterval, probeIntervalInSeconds * 1000);
  }

  stopProbeInterval() {
    if (this.probeInterval) clearInterval(this.probeInterval);
  }

  rollbar(shortMsg, err = {}) {
    const msg = `SessionRenewal-v4-${shortMsg}`;
    const {warnFn} = this.props;
    if (warnFn) return warnFn(msg, err);

    if (window.Rollbar && window.Rollbar.info) {
      window.Rollbar.info(msg, err);
    } else {
      // This fallback shouldn't happen, since the Rollbar reporting API should be mocked in 
      // local development.  But in case that fails or the lib fails to load, at least log t
      // the console so we know.
      console.log('window.Rollbar not found', msg, err); // eslint-disable-line
    }
  }

  shouldWarn() {
    const {probeIntervalInSeconds, warningDurationInSeconds} = this.props;
    const {probeJson} = this.state;
    if (!probeJson) return false;

    return shouldWarn(probeJson.remaining_seconds, probeIntervalInSeconds, warningDurationInSeconds);
  }

  // Side-effecting.  The intention is to help users who are in another tab see that
  // this tab is close to timing out.  It change the color of the favicon and the
  // document title to indicate there's a kind of notification.
  doUpdateAggressiveWarning(shouldWarn) {
    const actualTitle = window.document.title.replace(/^\(1\) /, '');
    const updatedDocumentTitle = (shouldWarn)
      ? '(1) ' + actualTitle
      : actualTitle;
    window.document.title = updatedDocumentTitle;

    // favicon
    const faviconEl = document.getElementById('favicon');
    const faviconHref = (shouldWarn)
      ? '/favicon-alert-orange-white.ico'
      : '/favicon.ico';
    faviconEl.href = faviconHref;
  }

  // At this point, any transient data in the browser will be rejected by the server.
  // If the server session has expired, this will redirect to the sign in page, clearing the
  // screen of student data.
  forciblyClearPage() {
    // This usually won't be reported since the request 
    // will be aborted by the navigation below.  For debugging issues,
    // look at the server logs for `/?expired-v4` instead.
    this.rollbar('forciblyClearPage');
    this.stopProbeInterval();

    const {forciblyClearPage} = this.props;
    if (forciblyClearPage) {
      forciblyClearPage();
    } else {
      window.location = '/?expired-v4';
    }
  }

  // This uses `fetch` directly to tell the difference
  // between a hard "failure" and a redirection or non-200 status
  // code.
  onProbeInterval() {
    apiFetch('/educators/probe')
      .then(this.onProbed)
      .catch(this.onProbeRequestFailed);
  }

  // If probe fails because user's session has expired, force reload
  // to clear tab.  If it's still valid, store the response with info
  // about how long is left, so we can warn the user.
  onProbed(fetchResponse) {
    // The session already expired, forcibly reload
    if (fetchResponse.status === 401) {
      this.forciblyClearPage();
      return;
    }

    // Store how much time left in the session
    fetchResponse.json().then(probeJson => this.setState({probeJson}));
  }
  
  // Report to Rollbar, but take no UI action
  onProbeRequestFailed(err) {
    this.rollbar('onProbeFailed', err);
  }

  onRenewClicked(e) {
    this.rollbar('onRenewClicked');
    e.preventDefault();
    apiFetchJson('/educators/reset')
      .then(this.onRenewCompleted)
      .catch(this.onRenewFailed);
  }

  onRenewCompleted(json) {
    this.rollbar('onRenewClicked');
    this.setState({shouldShowError: false});
    this.onProbeInterval(); // for immediate feedback if probeInterval is large
  }
 
  // If this failed, keep the page open since they just interacted
  // with the page, and the error message is better than navigating away
  // unexpectedly.  This stops the probe interval and so the tab would
  // stay visible, with the expectation that the user is about to take
  // some other action (like reloading, signing out/in or closing the tab).
  onRenewFailed() {
    this.rollbar('onRenewFailed');
    this.setState({shouldShowError: true});
    this.stopProbeInterval();
  }

  render() {
    const {shouldShowError} = this.state;

    if (shouldShowError) {
      return (
        <div style={styles.root}>There was an error with your session, please sign in again.</div>
      );
    }

    if (this.shouldWarn()) {
      return (
        <div style={styles.root}>
          <Lifecycle
            componentWillMount={this.doUpdateAggressiveWarning.bind(this, true)}
            componentWillUnmount={this.doUpdateAggressiveWarning.bind(this, false)}>
            Please click <a href="#" style={styles.link} onClick={this.onRenewClicked}>this link</a> or your session will timeout due to inactivity.
          </Lifecycle>
        </div>
      );
    }

    return null;
  }
}
SessionRenewal.propTypes = {
  probeIntervalInSeconds: PropTypes.number.isRequired,
  warningDurationInSeconds: PropTypes.number.isRequired,
  forciblyClearPage: PropTypes.func,
  warnFn: PropTypes.func
};

const styles = {
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'orange',
    color: 'white',
    textAlign: 'center',
    padding: 20,
    zIndex: 9999
  },
  link: {
    color: 'white',
    textDecoration: 'underline',
    fontSize: 16
  }
};


// Allow enough time to so that they are guaranteed to have at least
// `warningDurationInSeconds` to respond (or more, depending on probeInterval).
export function shouldWarn(remainingSeconds, probeIntervalInSeconds, warningDurationInSeconds) {
  return (remainingSeconds - probeIntervalInSeconds <= warningDurationInSeconds);
}
