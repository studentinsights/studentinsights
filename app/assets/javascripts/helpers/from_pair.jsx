(function() {
  window.shared || (window.shared = {});
  
  // in place of updating lodash to v4
  window.shared.fromPair = function(key, value) {
    const obj = {};
    obj[key] = value;
    return obj;
  };
})();