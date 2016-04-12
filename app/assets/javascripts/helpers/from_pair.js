(function() {
  window.shared || (window.shared = {});
  
  // in place of updating lodash to v4
  window.shared.fromPair = function(key, value) {
    var obj = {};
    obj[key] = value;
    return obj;
  };
})();