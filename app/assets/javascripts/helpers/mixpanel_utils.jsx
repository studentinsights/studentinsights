// This module expects window.mixpanel to be set, and window.share.Env to be set.
// To use it, call `registerUser` first, then `track`.
export default {

  registerUser: function(currentEducator) {
    const Mixpanel = window.mixpanel;
    const Env = window.shared.Env;
    const enabled = (Mixpanel && Env.shouldReportAnalytics);
    if (!enabled) return console.log('Mixpanel disabled'); // eslint-disable-line no-console

    try {
      Mixpanel.identify(currentEducator.id);
      Mixpanel.register({
        'deployment_key': Env.deploymentKey,
        'educator_id': currentEducator.id,
        'educator_is_admin': currentEducator.admin,
        'educator_school_id': currentEducator.school_id
      });
    }
    catch (err) {
      console.error(err); // eslint-disable-line no-console
    }
  },

  track: function(key, attrs) {
    const Mixpanel = window.mixpanel;
    const Env = window.shared.Env;
    const enabled = (Mixpanel && Env.shouldReportAnalytics);
    if (!enabled) return console.log('Mixpanel disabled'); // eslint-disable-line no-console

    try {
      return Mixpanel.track(key, attrs);
    }
    catch (err) {
      console.error(err); // eslint-disable-line no-console
    }
  }
};
