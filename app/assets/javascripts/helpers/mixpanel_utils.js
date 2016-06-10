(function() {
  // Define filter operations
  window.shared || (window.shared = {});
  var Env = window.shared.Env;

  window.shared.MixpanelUtils = {
    registerUser: function(currentEducator) {
      if (!window.mixpanel) return;
      if (!Env.shouldReportAnalytics) return;

      try {
        window.mixpanel.register({
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
      if (!window.mixpanel) return;
      try {
        return window.mixpanel.track(key, attrs);
      }
      catch (err) {
        console.error(err);
      }
    }
  };
})();