(function() {
  window.shared || (window.shared = {});

  // React helper fns
  window.shared.ReactHelpers = {
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
})();