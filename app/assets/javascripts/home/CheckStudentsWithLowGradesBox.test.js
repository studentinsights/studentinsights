import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import CheckStudentsWithLowGradesBox from './CheckStudentsWithLowGradesBox';
import studentsWithLowGradesJson from './home_students_with_low_grades_json';

function renderIntoEl(element) {
  const el = document.createElement('div');
  ReactDOM.render(element, el);
  return el;
}

function pureTestPropsForN(n) {
  return {
    limit: 10,
    totalCount: n,
    studentsWithLowGrades: studentsWithLowGradesJson.students_with_low_grades.slice(0, n)
  };
}

describe('CheckStudentsWithLowGradesBox', () => {
  it('renders zero, singular and plural states', () => {
    expect($(renderIntoEl(<CheckStudentsWithLowGradesBox {...pureTestPropsForN(0)} />)).text()).toContain('There are no students');
    expect($(renderIntoEl(<CheckStudentsWithLowGradesBox {...pureTestPropsForN(1)} />)).text()).toContain('There is one student');
    expect($(renderIntoEl(<CheckStudentsWithLowGradesBox {...pureTestPropsForN(4)} />)).text()).toContain('There are 4 students');
  });

  it('pure component matches snapshot', () => {
    const props = {
      limit: studentsWithLowGradesJson.limit,
      totalCount: studentsWithLowGradesJson.total_count,
      studentsWithLowGrades: studentsWithLowGradesJson.students_with_low_grades
    };
    const tree = renderer
      .create(<CheckStudentsWithLowGradesBox {...props} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });


  it('handles when limit reached', () => {
    const props = {
      limit: 3,
      totalCount: 129,
      studentsWithLowGrades: studentsWithLowGradesJson.students_with_low_grades.slice(0, 3)
    };
    const tree = renderer
      .create(<CheckStudentsWithLowGradesBox {...props} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});