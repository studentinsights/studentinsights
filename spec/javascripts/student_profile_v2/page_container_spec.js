//= require ./fixtures

describe('PageContainer', function() {
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var Simulate = React.addons.TestUtils.Simulate;
  var PageContainer = window.shared.PageContainer;    
  var Fixtures = window.shared.Fixtures;

  var helpers = {
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
    },

    findColumns: function(el) {
      return $(el).find('.summary-container > div');
    },
    
    createSpyActions: function() {
      return {
        onColumnClicked: jasmine.createSpy('onColumnClicked'),
        onClickSaveNotes: jasmine.createSpy('onClickSaveNotes')
      };
    },
    
    renderInto: function(el, props) {
      var mergedProps = merge(props || {}, {
        nowMomentFn: function() { return Fixtures.nowMoment; },
        serializedData: Fixtures.studentProfile,
        queryParams: {}
      });
      return ReactDOM.render(createEl(PageContainer, mergedProps), el);
    }
  };

  helpers.withTestEl('high-level integration tests', function() {
    it('renders everything on the happy path', function() {
      var el = this.testEl;
      helpers.renderInto(el);

      expect(el).toContainText('Daisy Poppins');
      expect(helpers.findColumns(el).length).toEqual(5);
      expect($('.Sparkline').length).toEqual(9);
      expect($('.InterventionsDetails').length).toEqual(1);
    });

    it('opens dialog when clicking Take Notes button', function() {
      var el = this.testEl;
      helpers.renderInto(el);

      $(el).find('.btn.take-notes').click();
      expect(el).toContainText('What are these notes from?');
      expect(el).toContainText('Save notes');
    });

    it('opens dialog when clicking Record Service Delivery button', function() {
      var el = this.testEl;
      helpers.renderInto(el);

      $(el).find('.btn.record-service').click();
      expect(el).toContainText('Who is working with Daisy?');
      expect(el).toContainText('Record service');
    });

    it('saving notes for SST meetings works, mocking the server calls', function() {
      var el = this.testEl;
      var component = helpers.renderInto(el, { actions: helpers.createSpyActions() });

      $(el).find('.btn.take-notes').click();
      helpers.changeTextValue($(el).find('textarea'), 'hello!');
      $(el).find('.btn.note-type:contains(SST meeting)').click();
      $(el).find('.btn.save').click();
      expect(component.props.actions.onClickSaveNotes).toHaveBeenCalledWith({
        eventNoteTypeId: 1,
        text: 'hello!'
      });
    });
  });
});