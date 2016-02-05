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
    },
    SharedPropTypes: {
      // Allow a prop to be null, if the prop type explicitly allows this.
      // Then fall back to another validator if a value is passed.
      nullable: function(validator) {
        return function(props, propName, componentName) {
          if (props[propName] === null) return null;
          return validator(props, propName, componentName);
        };
      }
    }
  };
})();