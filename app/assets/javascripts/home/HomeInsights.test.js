import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import fetchMock from 'fetch-mock/es5/client';
import HomeInsights, {UnsupportedStudentsPure} from './HomeInsights';
import SpecSugar from '../../../../spec/javascripts/support/spec_sugar.jsx';
import unsupportedLowGradesJson from '../../../../spec/javascripts/fixtures/home_unsupported_low_grades_json';


beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/home/unsupported_low_grades_json', unsupportedLowGradesJson);
});

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<HomeInsights />, el);
});

SpecSugar.withTestEl('integration tests', container => {
  it('renders everything after fetch', done => {
    const el = container.testEl;
    ReactDOM.render(<HomeInsights />, el);
    
    setTimeout(() => {
      expect(el.innerHTML).toContain('Unsupported students');
      done();
    }, 0);
  });
});

it('pure component matches snapshot', () => {
  const tree = renderer
    .create(<UnsupportedStudentsPure assignments={unsupportedLowGradesJson.assignments} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
