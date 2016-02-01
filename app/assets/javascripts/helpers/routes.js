(function() {
  // Routing functions
  window.shared || (window.shared = {});

  window.shared.Routes = {
    student: function(id) {
      return '/students/' + id;
    },
    homeroom: function(id) {
      return '/homerooms/' + id;
    }
  };
})();
