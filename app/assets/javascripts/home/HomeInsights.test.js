import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import fetchMock from 'fetch-mock/es5/client';
import HomeInsights, {CheckStudentWithLowGradesView} from './HomeInsights';
import SpecSugar from '../../../../spec/javascripts/support/spec_sugar.jsx';
import studentsWithLowGradesJson from '../../../../spec/javascripts/fixtures/home_students_with_low_grades_json';

function testProps() {
  return {
    educatorId: 9999
  };
}

describe('HomeInsights', () => {
  beforeEach(() => {
    fetchMock.restore();
    fetchMock.get('/home/students_with_low_grades_json?educator_id=9999&limit=100', studentsWithLowGradesJson);
  });

  it('renders without crashing', () => {
    const props = testProps();
    const el = document.createElement('div');
    ReactDOM.render(<HomeInsights {...props} />, el);
  });

  SpecSugar.withTestEl('integration tests', container => {
    it('renders everything after fetch', done => {
      const props = testProps();
      const el = container.testEl;
      ReactDOM.render(<HomeInsights {...props} />, el);
      
      setTimeout(() => {
        expect($(el).text()).toContain('There are 7 students in your classes');
        done();
      }, 0);
    });
  });
});

describe('CheckStudentWithLowGradesView', () => {
  it('pure component matches snapshot', () => {
    const props = {
      limit: studentsWithLowGradesJson.limit,
      totalCount: studentsWithLowGradesJson.total_count,
      studentsWithLowGrades: studentsWithLowGradesJson.students_with_low_grades
    };
    const tree = renderer
      .create(<CheckStudentWithLowGradesView {...props} />)
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
      .create(<CheckStudentWithLowGradesView {...props} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});