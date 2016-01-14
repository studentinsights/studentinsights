(function() {
  window.shared || (window.shared = {});

  // React helper fns
  window.shared.ReactHelpers = {
    dom: React.DOM,
    createEl: React.createElement.bind(React),
    merge: function() {
      var items = Array.prototype.slice.call(arguments);
      var out = {};
      items.forEach(function(item) {
        Object.keys(item).forEach(function(key) {
          out[key] = item[key];
        });
      });
      return out;
    }
  };
})();