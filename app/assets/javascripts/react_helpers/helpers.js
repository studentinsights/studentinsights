(function(root) {

  // React helper fns
  var ReactHelpers = {
    dom: React.DOM,
    createEl: React.createElement.bind(React),
    merge: function(a, b) {
      var out = {};
      Object.keys(a).concat(Object.keys(b)).forEach(function(key) {
        out[key] = b[key] || a[key];
      });
      return out;
    }
  };

  root.ReactHelpers = ReactHelpers;

})(window)
