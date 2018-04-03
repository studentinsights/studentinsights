import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import fetchMock from 'fetch-mock/es5/client';
import CheckStudentsWithHighAbsences, {CheckStudentsWithHighAbsencesView} from './CheckStudentsWithHighAbsences';
import SpecSugar from '../../../../spec/javascripts/support/spec_sugar.jsx';
import studentsWithHighAbsencesJson from '../../../../spec/javascripts/fixtures/home_students_with_high_absences_json';

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
    totalStudents: n,
    studentsWithHighAbsences: studentsWithHighAbsencesJson.students_with_high_absences.slice(0, n)
  };
}

describe('CheckStudentsWithHighAbsences', () => {
  beforeEach(() => {
    fetchMock.restore();
    fetchMock.get('/api/home/students_with_high_absences_json?educator_id=9999&limit=100', studentsWithHighAbsencesJson);
  });

  it('renders without crashing', () => {
    const props = testProps();
    const el = document.createElement('div');
    ReactDOM.render(<CheckStudentsWithHighAbsences {...props} />, el);
  });

  SpecSugar.withTestEl('integration tests', container => {
    it('renders everything after fetch', done => {
      const props = testProps();
      const el = container.testEl;
      ReactDOM.render(<CheckStudentsWithHighAbsences {...props} />, el);
      
      setTimeout(() => {
        expect($(el).text()).toContain('There is one student');
        done();
      }, 0);
    });
  });
});

describe('CheckStudentsWithHighAbsencesView', () => {
  it('renders zero, singular and plural states', () => {
    expect($(renderIntoEl(<CheckStudentsWithHighAbsencesView {...pureTestPropsForN(0)} />)).text()).toContain('There are no students');
    expect($(renderIntoEl(<CheckStudentsWithHighAbsencesView {...pureTestPropsForN(1)} />)).text()).toContain('There is one student');
    expect($(renderIntoEl(<CheckStudentsWithHighAbsencesView {...pureTestPropsForN(4)} />)).text()).toContain('There are 4 students');
  });

  it('pure component matches snapshot', () => {
    const props = {
      limit: studentsWithHighAbsencesJson.limit,
      totalStudents: studentsWithHighAbsencesJson.total_students,
      studentsWithHighAbsences: studentsWithHighAbsencesJson.students_with_high_absences
    };
    const tree = renderer
      .create(<CheckStudentsWithHighAbsencesView {...props} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });


  it('handles when limit reached', () => {
    const props = {
      limit: 3,
      totalStudents: 129,
      studentsWithHighAbsences: studentsWithHighAbsencesJson.students_with_high_absences.slice(0, 3)
    };
    const tree = renderer
      .create(<CheckStudentsWithHighAbsencesView {...props} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});