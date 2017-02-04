//= require ../fixtures/fixture_constant_indexes
//= require ../fixtures/fixture_students

describe('SlicePanels', function() {
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var SpecSugar = window.shared.SpecSugar;
  var SlicePanels = window.shared.SlicePanels;
  var FixtureConstantIndexes = window.shared.FixtureConstantIndexes;
  var FixtureStudents = window.shared.FixtureStudents;

  var helpers = {
    renderInto: function(el, props) {
      var mergedProps = merge({
        filters: [],
        serviceTypesIndex: FixtureConstantIndexes.serviceTypesIndex,
        eventNoteTypesIndex: FixtureConstantIndexes.eventNoteTypesIndex,
        students: [],
        allStudents: [],
        onFilterToggled: jasmine.createSpy('onFilterToggled')
      }, props || {});
      return ReactDOM.render(createEl(SlicePanels, mergedProps), el);
    },

    // Returns a matrix of the kinds of things that users can slice by in each
    // column (eg., disability, STAR reading quartile).
    columnTitlesMatrix: function(el) {
      var columnEls = $(el).find('.column').toArray();
      return columnEls.map(function(columnEl) {
        return $(columnEl).find('.fixed-table-title').toArray().map(function(titleEl) {
          return $(titleEl).text();
        });
      });
    },

    // Count how many attributes there are for each table in each column
    // (e.g., how many "Disability" options are there, and how many
    // "STAR Reading" options are there for slicing by.
    rowsPerColumnMatrix: function(el) {
      var columnEls = $(el).find('.column').toArray();
      return columnEls.map(function(columnEl) {
        return $(columnEl).find('table').toArray().map(function(tableEl) {
          return $(tableEl).find('tbody tr').length;
        });
      });
    }
  };

  SpecSugar.withTestEl('high-level integration tests', function() {
    it('renders everything on the happy path', function() {
      var el = this.testEl;
      helpers.renderInto(el);

      expect($(el).find('.SlicePanels').length).toEqual(1);
      expect($(el).find('.column').length).toEqual(6);
      expect(helpers.columnTitlesMatrix(el)).toEqual([
        [ 'Disability', 'Low Income', 'LEP', 'Race', 'Hispanic/Latino', 'Gender' ],
        [ 'Grade', 'Years enrolled', 'Risk level' ],
        [ 'STAR Reading', 'MCAS ELA Score', 'MCAS ELA SGP' ],
        [ 'STAR Math', 'MCAS Math Score', 'MCAS Math SGP' ],
        [ 'Discipline incidents', 'Absences', 'Tardies' ],
        [ 'Services', 'Summer', 'Notes', 'Program', 'Homeroom' ]
      ]);
    });

    it('renders attributes for slicing based on student data', function() {
      var el = this.testEl;
      helpers.renderInto(el, {
        students: FixtureStudents,
        allStudents: FixtureStudents
      });

      expect(helpers.rowsPerColumnMatrix(el)).toEqual([
        [ 5, 1, 1, 2, 2, 0 ],
        [ 1, 1, 5 ],
        [ 5, 5, 5 ],
        [ 5, 5, 5 ],
        [ 5, 5, 5 ],
        [ 4, 1, 4, 2, 1 ]
      ]);
    });
  });
});
