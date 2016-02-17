(function() {
  window.shared || (window.shared = {});
  var Simulate = React.addons.TestUtils.Simulate;

  /* Sugar for common test setup and interactions */  
  var SpecSugar = window.shared.SpecSugar = {
    withTestEl: function(description, testsFn) {
      return describe(description, function() {
        beforeEach(function() {
          this.testEl = $('<div id="test-el" />').get(0);
          $('body').append(this.testEl);
        });

        afterEach(function() {
          $(this.testEl).remove();
        });

        testsFn.call(this);
      });
    },

    // Update the text value of an input or textarea, and simulate the React
    // change event.
    changeTextValue: function($el, value) {
      $el.val(value);
      Simulate.change($el.get(0));
      return undefined;
    }
  };
})();