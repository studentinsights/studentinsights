//= require ./fixtures

describe('StudentProfileHeader', function() {
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var StudentProfileHeader = window.shared.StudentProfileHeader;
  var SpecSugar = window.shared.SpecSugar;
  var Fixtures = window.shared.Fixtures;

  var helpers = {
    renderActiveStudent: function(el, props) {
      var mergedProps = merge(props || {}, { student: Fixtures.studentProfile.student });
      return ReactDOM.render(createEl(StudentProfileHeader, mergedProps), el);
    },

    renderTransferredStudent: function(el, props) {
      var this_student = Fixtures.studentProfile.student;
      this_student['enrollment_status'] = 'Transferred';

      var mergedProps = merge(props || {}, { student: this_student });
      return ReactDOM.render(createEl(StudentProfileHeader, mergedProps), el);
    }

  };

  SpecSugar.withTestEl('active enrolled student', function() {
    it('renders note-taking area with homeroom', function() {
      var el = this.testEl;
      helpers.renderActiveStudent(el);
      var yearsOld = moment().diff(Fixtures.studentProfile.student.date_of_birth, 'years'); // TODO (ARS): mock moment.utc() for spec
                                                                                           // so we don't have to calculate this

      expect(el).toContainText('Daisy Poppins');
      expect(el).toContainText('Arthur D Healey');
      expect(el).toContainText('5/23/2008');
      expect(el).toContainText('(' + yearsOld + ' years old)');
      expect($(el).find('a.homeroom-link')).toContainText('102');
    });
  });

  SpecSugar.withTestEl('non-active Transferred student', function() {
    it('renders note-taking area with Transferred status', function() {
      var el = this.testEl;
      helpers.renderTransferredStudent(el);

      expect(el).toContainText('Daisy Poppins');
      expect(el).toContainText('Arthur D Healey');
      expect(el).toContainText('Transferred');
    });
  });

});
