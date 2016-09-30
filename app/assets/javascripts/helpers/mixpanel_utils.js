(function() {
  // Define filter operations
  window.shared || (window.shared = {});
  var Env = window.shared.Env;
  var mixpanel = window.mixpanel;

  var MixpanelUtils = window.shared.MixpanelUtils = {
    isMixpanelEnabled: function() {
      return (mixpanel && Env.shouldReportAnalytics);
    },
    registerUser: function(currentEducator) {
      if (!MixpanelUtils.isMixpanelEnabled()) return;

      try {
        mixpanel.identify(currentEducator.id);
        mixpanel.register({
          'deployment_key': Env.deploymentKey,
          'educator_id': currentEducator.id,
          'educator_is_admin': currentEducator.admin,
          'educator_school_id': currentEducator.school_id
        });
      }
      catch (err) {
        console.error(err);
      }
    },
    track: function(key, attrs) {
      if (!MixpanelUtils.isMixpanelEnabled()) return;
      try {
        return mixpanel.track(key, attrs);
      }
      catch (err) {
        console.error(err);
      }
    }
  };
})();