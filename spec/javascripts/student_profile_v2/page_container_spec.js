//= require ./fixtures

describe('PageContainer', function() {
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var PageContainer = window.shared.PageContainer;    
  var Fixtures = window.shared.Fixtures;

  var helpers = {
    findColumns: function(el) {
      return $(el).find('.summary-container > div');
    }
  };

  describe('high-level integration tests', function() {
    beforeEach(function() {
      this.testEl = $('<div id="test-el" />').get(0);
      $('body').append(this.testEl);
    });

    afterEach(function() {
      $(this.testEl).remove();
    });

    it('renders everything on the happy path', function() {
      var el = this.testEl;

      ReactDOM.render(createEl(PageContainer, {
        nowMomentFn: function() { return Fixtures.nowMoment; },
        serializedData: Fixtures.studentProfile,
        queryParams: {}
      }), el);

      // student name
      expect(el).toContainText('Daisy Poppins');

      // five columns with sparklines
      expect(helpers.findColumns(el).length).toEqual(5);
      expect($('.Sparkline').length).toEqual(9);

      // intervention selected
      // notes and services
      expect($('.InterventionsDetails').length).toEqual(1);
      
    });
  });
});