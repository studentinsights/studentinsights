(function() {
  window.shared || (window.shared = {});
  
  var merge = window.shared.ReactHelpers.merge;

  // Follow path of `keys` into object.  If any do not exist, throw.
  // At the end of the `keys` path, 
  var updatedMap = window.shared.updatedMap = function(object, keys, value) {
    if (keys.length === 0) return value;
    if (!_.isObject(object)) throw new Error('Expected an object but found: ' + object);

    var thisKey = _.first(keys);
    var nextObject = object[thisKey];
    if (_.isNull(nextObject) || _.isUndefined(nextObject)) throw new Error('Could not traverse key path: [' + keys.join(',') + '].');
    
    var updatedChild = {};
    updatedChild[thisKey] = updated(nextObject, _.tail(keys, 1), value);
    return merge(object, updatedChild);
  };
})();