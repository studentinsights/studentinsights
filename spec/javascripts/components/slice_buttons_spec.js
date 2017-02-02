//= require ../fixtures/fixture_constant_indexes
//= require ../fixtures/fixture_students

describe('SliceButtons', function() {
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var SpecSugar = window.shared.SpecSugar;
  var SliceButtons = window.shared.SliceButtons;
  var FixtureConstantIndexes = window.shared.FixtureConstantIndexes;
  var FixtureStudents = window.shared.FixtureStudents;

  var helpers = {
    renderInto: function(el, props) {
      var mergedProps = merge({
        students: [],
        filters: [],
        filtersHash: '',
        clearFilters: jasmine.createSpy('clearFilters')
      }, props || {});
      return ReactDOM.render(createEl(SliceButtons, mergedProps), el);
    }
  };

  SpecSugar.withTestEl('high-level integration tests', function() {
    it('renders everything on the happy path', function() {
      var el = this.testEl;
      helpers.renderInto(el);

      expect(el).toContainText('Share');
    });
  });
});
