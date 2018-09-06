import React from 'react';
import ReactDOM from 'react-dom';
import fetchMock from 'fetch-mock/es5/client';
import CheckStudentsWithLowGrades from './CheckStudentsWithLowGrades';
import studentsWithLowGradesJson from './home_students_with_low_grades_json';

function testProps() {
  return {
    educatorId: 9999
  };
}

describe('CheckStudentsWithLowGrades', () => {
  beforeEach(() => {
    fetchMock.restore();
    fetchMock.get('/api/home/students_with_low_grades_json?educator_id=9999&limit=100', studentsWithLowGradesJson);
  });

  it('renders without crashing', () => {
    const props = testProps();
    const el = document.createElement('div');
    ReactDOM.render(<CheckStudentsWithLowGrades {...props} />, el);
  });


  it('renders everything after fetch', done => {
    const props = testProps();
    const el = document.createElement('div');
    ReactDOM.render(<CheckStudentsWithLowGrades {...props} />, el);
    
    setTimeout(() => {
      expect($(el).text()).toContain('There are 7 students in your classes');
      done();
    }, 0);
  });
});
