// This module expects window.mixpanel to be set, and window.share.Env to be set.
// To use it, call `registerUser` first, then `track`.
export default {
  registerUser(currentEducator) {
    const enabled = (window.mixpanel && window.shared.Env.shouldReportAnalytics);

    if (!enabled) return;

    try {
      window.mixpanel.identify(currentEducator.id);
      window.mixpanel.register({
        'deployment_key': window.shared.Env.deploymentKey,
        'educator_id': currentEducator.id,
        'educator_is_admin': currentEducator.admin,
        'educator_school_id': currentEducator.school_id
      });
    }
    catch (err) {
      console.error(err); // eslint-disable-line no-console
    }
  },

  track(key, attrs) {
    const enabled = (window.mixpanel && window.shared.Env.shouldReportAnalytics);

    if (!enabled) return;

    try {
      return window.mixpanel.track(key, attrs);
    }
    catch (err) {
      console.error(err); // eslint-disable-line no-console
    }
  }
};