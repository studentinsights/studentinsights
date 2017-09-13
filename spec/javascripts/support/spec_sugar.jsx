/* Sugar for common test setup and interactions */  
export default {
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
    React.addons.TestUtils.Simulate.change($el.get(0));
    return undefined;
  },

  // Simulates opening the react-select dropdown and clicking the item
  // with `optionText`.
  changeReactSelect: function($selectEl, optionText) {
    React.addons.TestUtils.Simulate.mouseDown($selectEl.find('.Select-arrow-zone').get(0));
    React.addons.TestUtils.Simulate.focus($selectEl.find('input:last').get(0));
    $selectEl.find('.Select-option:contains(' + optionText + ')').click();
    return undefined;
  },

  // For mocking history API
  history: function() {
    return {
      replaceState: jasmine.createSpy('replaceState'),
      pushState: jasmine.createSpy('pushState')
    };
  }
};