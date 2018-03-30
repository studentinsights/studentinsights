import React from 'react';
import ReactDOM from 'react-dom';
import HomeInsights from './HomeInsights';
import SpecSugar from '../../../../spec/javascripts/support/spec_sugar.jsx';


function testProps() {
  return {
    educatorId: 9999
  };
}

jest.mock('./CheckStudentsWithLowGrades');
describe('HomeInsights', () => {
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