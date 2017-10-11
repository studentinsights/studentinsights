(function() {
  // Adapted from https://github.com/velesin/jasmine-jquery
  beforeEach(function() {
    jasmine.addMatchers({
      toContainText: function () {
        return {
          compare: function (actual, text) {
            const trimmedText = $.trim($(actual).text());

            if (text && $.isFunction(text.test)) {
              return { pass: text.test(trimmedText) };
            } else {
              return { pass: trimmedText.indexOf(text) !== -1 };
            }
          }
        };
      }
    });
  });
}());
