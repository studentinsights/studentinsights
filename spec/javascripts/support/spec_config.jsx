(function() {
  // Monkey-patch console.error so any calls to it fail the test.
  // This covers React PropType validations as well.
  console.error = function(message) { //eslint-disable-line no-console
    const args = Array.prototype.slice.call(arguments);
    throw new Error(message, args.slice(1));
  };
})();