(function() {
  // Routing functions
  window.shared || (window.shared = {});
  window.shared.Routes = {
    student: function(id) {
      return '/students/' + id;
    },
    studentProfile: function(id, queryParams) {
      return '/students/' + id + 'profile' + (_.isObject(queryParams)) ? '?' + $.param(queryParams) : '';
    },
    homeroom: function(id) {
      return '/homerooms/' + id;
    },
    school: function(id) {
      return '/schools/' + id;
    }
  };
})();
