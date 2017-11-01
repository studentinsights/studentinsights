window.shared || (window.shared = {});
const Env = window.shared.Env;

export default {

  registerUser: function(currentEducator) {
    const enabled = (window.mixpanel && Env.shouldReportAnalytics);

    if (!enabled) return;

    try {
      window.mixpanel.identify(currentEducator.id);
      window.mixpanel.register({
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
    const enabled = (window.mixpanel && Env.shouldReportAnalytics);

    if (!enabled) return;

    try {
      return window.mixpanel.track(key, attrs);
    }
    catch (err) {
      console.error(err); // eslint-disable-line no-console
    }
  }
};
