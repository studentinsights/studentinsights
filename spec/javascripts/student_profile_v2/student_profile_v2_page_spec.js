//= require ./fixtures

describe('StudentProfileV2Page', function() {
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var SpecSugar = window.shared.SpecSugar;
  var Fixtures = window.shared.Fixtures;
  var PageContainer = window.shared.PageContainer;
  var StudentProfileV2Page = window.shared.StudentProfileV2Page;

  var helpers = {
    renderStudentProfilePage: function(el, grade, dibels) {
      var serializedData = _.cloneDeep(Fixtures.studentProfile);
      if (grade) { serializedData["student"]["grade"] = grade; };
      if (dibels) { serializedData["dibels"] = dibels; };

      var mergedProps = {
        serializedData: serializedData,
        nowMomentFn: function() { return Fixtures.nowMoment; },
        queryParams: {}
      };
      return ReactDOM.render(createEl(PageContainer, mergedProps), el);
    }
  }

  SpecSugar.withTestEl('#renderMcasElaSgpOrDibels', function() {

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
