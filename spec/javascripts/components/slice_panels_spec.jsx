import SpecSugar from '../support/spec_sugar.jsx';
import {serviceTypesIndex, eventNoteTypesIndex} from '../fixtures/database_constants.jsx';
import FixtureStudents from '../fixtures/students.jsx';


describe('SlicePanels', function() {
  const ReactDOM = window.ReactDOM;
  const merge = window.shared.ReactHelpers.merge;
  const SlicePanels = window.shared.SlicePanels;

  const helpers = {
    renderInto: function(el, props) {
      const mergedProps = merge({
        filters: [],
        serviceTypesIndex,
        eventNoteTypesIndex,
        school: {
          school_type: 'ES'
        },
        students: [],
        allStudents: [],
        onFilterToggled: jest.fn()
      }, props || {});
      ReactDOM.render(<SlicePanels {...mergedProps} />, el);
    },

    // Returns a matrix of the kinds of things that users can slice by in each
    // column (eg., disability, STAR reading quartile).
    columnTitlesMatrix: function(el) {
      const columnEls = $(el).find('.column').toArray();
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
      const columnEls = $(el).find('.column').toArray();
      return columnEls.map(function(columnEl) {
        return $(columnEl).find('table').toArray().map(function(tableEl) {
          return $(tableEl).find('tbody tr').length;
        });
      });
    }
  };

  SpecSugar.withTestEl('high-level integration tests', function(container) {
    it('renders everything on the happy path', function() {
      const el = container.testEl;
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

    it('renders everything on the happy path for high school', function() {
      const el = container.testEl;
      helpers.renderInto(
        el,
        {
          school: {
            school_type: 'HS'
          }
        }
      );

      expect($(el).find('.SlicePanels').length).toEqual(1);
      expect($(el).find('.column').length).toEqual(6);
      expect(helpers.columnTitlesMatrix(el)).toEqual([
        [ 'Disability', 'Low Income', 'LEP', 'Race', 'Hispanic/Latino', 'Gender' ],
        [ 'Grade', 'House', 'Counselor', 'Years enrolled', 'Risk level' ],
        [ 'STAR Reading', 'MCAS ELA Score', 'MCAS ELA SGP' ],
        [ 'STAR Math', 'MCAS Math Score', 'MCAS Math SGP' ],
        [ 'Discipline incidents', 'Absences', 'Tardies' ],
        [ 'Services', 'Summer', 'Notes', 'Program', 'Homeroom' ]
      ]);
    });

    it('renders attributes for slicing based on student data', function() {
      const el = container.testEl;
      helpers.renderInto(el, {
        students: FixtureStudents,
        allStudents: FixtureStudents
      });

      expect(helpers.rowsPerColumnMatrix(el)).toEqual([
        [ 5, 1, 1, 2, 3, 0 ],
        [ 1, 1, 5 ],
        [ 5, 5, 5 ],
        [ 5, 5, 5 ],
        [ 5, 5, 5 ],
        [ 4, 1, 4, 2, 1 ]
      ]);
    });
  });
});
