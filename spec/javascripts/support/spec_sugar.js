/* Sugar for common test setup and interactions */  
export default {
  withTestEl: function(description, testsFn) {
    const container = {};
    return describe(description, function() {
      beforeEach(function() {
        container.testEl = $('<div id="test-el" />').get(0);
        $('body').append(container.testEl);
      });

      afterEach(function() {
        $(container.testEl).remove();
      });

      testsFn.call(null, container);
    });
  }
};