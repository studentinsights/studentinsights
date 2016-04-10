(function() {
  // Routing functions
  window.shared || (window.shared = {});
  window.shared.Routes = {
    studentProfile: function(id, queryParams) {
      var queryString = _.isObject(queryParams)
        ? '?' + $.param(queryParams)
        : '';
      return '/students/' + id + queryString;
    },
    homeroom: function(id) {
      return '/homerooms/' + id;
    },
    school: function(id) {
      return '/schools/' + id;
    }
  };
})();
