import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import fetchMock from 'fetch-mock/es5/client';
import CheckStudentsWithLowGrades, {CheckStudentsWithLowGradesView} from './CheckStudentsWithLowGrades';
import SpecSugar from '../../../../spec/javascripts/support/spec_sugar.jsx';
import studentsWithLowGradesJson from '../../../../spec/javascripts/fixtures/home_students_with_low_grades_json';

function renderIntoEl(element) {
  const el = document.createElement('div');
  ReactDOM.render(element, el);
  return el;
}

function testProps() {
  return {
    educatorId: 9999
  };
}

function pureTestPropsForN(n) {
  return {
    limit: 10,
    totalCount: n,
    studentsWithLowGrades: studentsWithLowGradesJson.students_with_low_grades.slice(0, n)
  };
}

// describe('CheckStudentsWithLowGrades', () => {
//   beforeEach(() => {
//     fetchMock.restore();
//     fetchMock.get('/home/students_with_low_grades_json?educator_id=9999&limit=100', studentsWithLowGradesJson);
//   });

//   it('renders without crashing', () => {
//     const props = testProps();
//     const el = document.createElement('div');
//     ReactDOM.render(<CheckStudentsWithLowGrades {...props} />, el);
//   });

//   SpecSugar.withTestEl('integration tests', container => {
//     it('renders everything after fetch', done => {
//       const props = testProps();
//       const el = container.testEl;
//       ReactDOM.render(<CheckStudentsWithLowGrades {...props} />, el);
      
//       setTimeout(() => {
//         expect($(el).text()).toContain('There are 7 students in your classes');
//         done();
//       }, 0);
//     });
//   });
// });

// describe('CheckStudentsWithLowGradesView', () => {
//   it('renders zero, singular and plural states', () => {
//     expect($(renderIntoEl(<CheckStudentsWithLowGradesView {...pureTestPropsForN(0)} />)).text()).toContain('There are no students');
//     expect($(renderIntoEl(<CheckStudentsWithLowGradesView {...pureTestPropsForN(1)} />)).text()).toContain('There is one student');
//     expect($(renderIntoEl(<CheckStudentsWithLowGradesView {...pureTestPropsForN(4)} />)).text()).toContain('There are 4 students');
//   });

//   it('pure component matches snapshot', () => {
//     const props = {
//       limit: studentsWithLowGradesJson.limit,
//       totalCount: studentsWithLowGradesJson.total_count,
//       studentsWithLowGrades: studentsWithLowGradesJson.students_with_low_grades
//     };
//     const tree = renderer
//       .create(<CheckStudentsWithLowGradesView {...props} />)
//       .toJSON();
//     expect(tree).toMatchSnapshot();
//   });


//   it('handles when limit reached', () => {
//     const props = {
//       limit: 3,
//       totalCount: 129,
//       studentsWithLowGrades: studentsWithLowGradesJson.students_with_low_grades.slice(0, 3)
//     };
//     const tree = renderer
//       .create(<CheckStudentsWithLowGradesView {...props} />)
//       .toJSON();
//     expect(tree).toMatchSnapshot();
//   });
// });