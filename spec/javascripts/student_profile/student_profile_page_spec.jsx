import { studentProfile, nowMoment } from './fixtures.jsx';
import SpecSugar from '../support/spec_sugar.jsx';

describe('StudentProfilePage integration test', () => {
  const ReactDOM = window.ReactDOM;
  const PageContainer = window.shared.PageContainer;

  const helpers = {
    renderStudentProfilePage(el, grade, dibels, absencesCount) {
      const serializedData = _.cloneDeep(studentProfile);
      if (grade !== undefined) {
        serializedData.student.grade = grade;
      }

      if (dibels !== undefined) {
        serializedData.dibels = dibels;
      }

      if (absencesCount !== undefined) {
        serializedData.student.absences_count = absencesCount;
      }


      const mergedProps = {
        serializedData,
        nowMomentFn() { return nowMoment; },
        queryParams: {},
        history: SpecSugar.history()
      };
      ReactDOM.render(<PageContainer {...mergedProps} />, el);
    }
  };

  SpecSugar.withTestEl('renders attendance event summaries correctly', () => {
    describe('student with no absences this school year', () => {
      it('displays zero absences', function () {
        const el = this.testEl;
        helpers.renderStudentProfilePage(el, null, [], 0);
        expect(el).toContainText('Absences this school year:0');
      });
    });

    describe('student with 15 absences this school year', () => {
      it('displays 15 absences', function () {
        const el = this.testEl;
        helpers.renderStudentProfilePage(el);
        expect(el).toContainText('Absences this school year:15');
      });
    });
  });

  SpecSugar.withTestEl('renders MCAS/DIBELS correctly according to grade level', () => {
    describe('student in grade 3', () => {
      describe('student with DIBELS result', () => {
        it('renders the latest DIBELS', function () {
          const el = this.testEl;
          helpers.renderStudentProfilePage(el, '3', [{ performance_level: 'INTENSIVE ' }]);
          expect(el).not.toContainText('MCAS ELA SGP');
          expect(el).toContainText('DIBELS');
          expect(el).toContainText('INTENSIVE');
        });
      });

      describe('student without DIBELS result', () => {
        it('renders MCAS ELA SGP', function () {
          const el = this.testEl;
          helpers.renderStudentProfilePage(el, '3', []);
          expect(el).toContainText('MCAS ELA SGP');
        });
      });
    });

    describe('student in grade 5', () => {
      describe('student with DIBELS result', () => {
        it('renders MCAS ELA SGP', function () {
          const el = this.testEl;
          helpers.renderStudentProfilePage(el, '5', [{ performance_level: 'INTENSIVE ' }]);
          expect(el).toContainText('MCAS ELA SGP');
        });
      });

      describe('student without DIBELS result', () => {
        it('renders MCAS ELA SGP', function () {
          const el = this.testEl;
          helpers.renderStudentProfilePage(el, '5', []);
          expect(el).toContainText('MCAS ELA SGP');
        });
      });
    });
  });
});
