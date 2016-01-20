(function(root) {

  var Routes = {
    student: function(id) {
      return '/students/' + id;
    },
    homeroom: function(id) {
      return '/homerooms/' + id;
    }
  };

  root.Routes = Routes;

})(window)
