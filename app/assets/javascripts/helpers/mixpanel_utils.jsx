(function() {
  // Define filter operations
  window.shared || (window.shared = {});
  const Env = window.shared.Env;

  const MixpanelUtils = window.shared.MixpanelUtils = {
    isMixpanelEnabled: function() {
      return (window.mixpanel && Env.shouldReportAnalytics);
    },
    registerUser: function(currentEducator) {
      if (!MixpanelUtils.isMixpanelEnabled()) return;

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
      if (!MixpanelUtils.isMixpanelEnabled()) return;
      try {
        return window.mixpanel.track(key, attrs);
      }
      catch (err) {
        console.error(err); // eslint-disable-line no-console
      }
    }
  };
})();