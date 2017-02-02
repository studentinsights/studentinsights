(function() {
  // Monkey-patch console.error so any calls to it fail the test.
  // This covers React PropType validations as well.
  var consoleError = console.error;
  console.error = function(message) {
    var args = Array.prototype.slice.call(arguments);
    throw new Error(message, args.slice(1));
    consoleError.apply(console, args);
  };
})();