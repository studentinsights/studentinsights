import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import fetchMock from 'fetch-mock/es5/client';
import HomeInsights, {UnsupportedStudentsPure} from './HomeInsights';
import SpecSugar from '../../../../spec/javascripts/support/spec_sugar.jsx';
import unsupportedLowGradesJson from '../../../../spec/javascripts/fixtures/home_unsupported_low_grades_json';

function testProps() {
  return {
    educatorId: 9999
  };
}

describe('HomeInsights', () => {
  beforeEach(() => {
    fetchMock.restore();
    fetchMock.get('/home/unsupported_low_grades_json?educator_id=9999&limit=100', unsupportedLowGradesJson);
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
        expect(el.innerHTML).toContain('Students to check on');
        done();
      }, 0);
    });
  });
});

describe('UnsupportedStudentsPure', () => {
  it('pure component matches snapshot', () => {
    const props = {
      limit: unsupportedLowGradesJson.limit,
      totalCount: unsupportedLowGradesJson.total_count,
      assignments: unsupportedLowGradesJson.assignments
    };
    const tree = renderer
      .create(<UnsupportedStudentsPure {...props} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });


  it('handles when limit reached', () => {
    const props = {
      limit: 3,
      totalCount: 129,
      assignments: unsupportedLowGradesJson.assignments.slice(0, 3)
    };
    const tree = renderer
      .create(<UnsupportedStudentsPure {...props} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});