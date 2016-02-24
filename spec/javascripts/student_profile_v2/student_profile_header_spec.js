//= require ./fixtures

describe('StudentProfileHeader', function() {
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var StudentProfileHeader = window.shared.StudentProfileHeader;
  var SpecSugar = window.shared.SpecSugar;
  var Fixtures = window.shared.Fixtures;

  var helpers = {
    renderInto: function(el, props) {
      var mergedProps = merge(props || {}, {
        student: Fixtures.studentProfile.student
      });
      return ReactDOM.render(createEl(StudentProfileHeader, mergedProps), el);
    }
  };

  SpecSugar.withTestEl('high-level integration tests', function() {
    it('renders note-taking area', function() {
      var el = this.testEl;
      helpers.renderInto(el);

      expect(el).toContainText('Daisy Poppins');
      expect(el).toContainText('Arthur D Healey');
      expect($(el).find('a.homeroom-link')).toContainText('102');
    });
  });
});