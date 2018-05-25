// This function is deprecated.
// Use {...obj} destructuring for new code.
export function merge() {
  // Combines several objects into one.
  // Does not mutate its arguments.
  // e.g. merge({a: 1, b: 2}, {c: 'hi!'}) = {a: 1, b: 2, c: 'hi!'}
  const items = Array.prototype.slice.call(arguments);
  const out = {};
  items.forEach(function(item) {
    Object.keys(item).forEach(function(key) {
      out[key] = item[key];
    });
  });
  return out;
}
