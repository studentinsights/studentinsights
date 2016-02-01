(function() {
  // Define filter operations
  window.shared || (window.shared = {});
  window.shared.MixpanelUtils = {
    registerUser: function(currentEducator) {
      mixpanel.register({
        'educator_id': currentEducator.id,
        'educator_is_admin': currentEducator.admin,
        'educator_school_id': currentEducator.school_id
      });
    }
  };
})();