//= require ./fixtures

describe('StudentProfilePage', function() {
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var SpecSugar = window.shared.SpecSugar;
  var Fixtures = window.shared.Fixtures;
  var PageContainer = window.shared.PageContainer;
  var StudentProfilePage = window.shared.StudentProfilePage;

  var helpers = {
    renderStudentProfilePage: function(el, grade, dibels, absencesCount) {
      var serializedData = _.cloneDeep(Fixtures.studentProfile);
      if (grade !== undefined) {
        serializedData["student"]["grade"] = grade;
      };

      if (dibels !== undefined) {
        serializedData["dibels"] = dibels;
      };

      if (absencesCount !== undefined) {
        serializedData["student"]["absences_count"] = absencesCount;
      };


      var mergedProps = {
        serializedData: serializedData,
        nowMomentFn: function() { return Fixtures.nowMoment; },
        queryParams: {},
        history: SpecSugar.history()
      };
      return ReactDOM.render(createEl(PageContainer, mergedProps), el);
    }
  }

  SpecSugar.withTestEl('renders attendance event summaries correctly', function() {

    describe('student with no absences this school year', function () {
      it('displays zero absences', function () {
        var el = this.testEl;
        helpers.renderStudentProfilePage(el, null, null, 0);
        expect(el).toContainText('Absences this school year:0');
      });
    });

    describe('student with 15 absences this school year', function () {
      it('displays 15 absences', function () {
        var el = this.testEl;
        helpers.renderStudentProfilePage(el);
        expect(el).toContainText('Absences this school year:15');
      });
    });

  });

  SpecSugar.withTestEl('renders MCAS/DIBELS correctly according to grade level', function() {

    describe('student in grade 3', function() {

      describe('student with DIBELS result', function() {
        it('renders the latest DIBELS', function () {
          var el = this.testEl;
          helpers.renderStudentProfilePage(el, '3', [{ 'performance_level': 'INTENSIVE '}]);
          expect(el).not.toContainText('MCAS ELA SGP');
          expect(el).toContainText('DIBELS');
          expect(el).toContainText('INTENSIVE');
        });

      });

      describe('student without DIBELS result', function() {
        it('renders MCAS ELA SGP', function () {
          var el = this.testEl;
          helpers.renderStudentProfilePage(el, '3', []);
          expect(el).toContainText('MCAS ELA SGP');
        });
      });

    });

    describe('student in grade 5', function() {

      describe('student with DIBELS result', function() {
        it('renders MCAS ELA SGP', function () {
          var el = this.testEl;
          helpers.renderStudentProfilePage(el, '5', [{ 'performance_level': 'INTENSIVE '}]);
          expect(el).toContainText('MCAS ELA SGP');
        });
      });

      describe('student without DIBELS result', function() {
        it('renders MCAS ELA SGP', function () {
          var el = this.testEl;
          helpers.renderStudentProfilePage(el, '5', []);
          expect(el).toContainText('MCAS ELA SGP');
        });
      });

    });

  });

});
