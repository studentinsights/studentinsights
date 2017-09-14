(function () {
  // Adapted from https://github.com/velesin/jasmine-jquery
  beforeEach(() => {
    jasmine.addMatchers({
      toContainText() {
        return {
          compare(actual, text) {
            const trimmedText = $.trim($(actual).text());

            if (text && $.isFunction(text.test)) {
              return { pass: text.test(trimmedText) };
            }
            return { pass: trimmedText.indexOf(text) != -1 };
          }
        };
      }
    });
  });
}());
