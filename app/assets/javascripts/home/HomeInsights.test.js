import React from 'react';
import ReactDOM from 'react-dom';
import HomeInsights from './HomeInsights';

function testProps() {
  return {
    educatorId: 9999
  };
}

jest.mock('./CheckStudentsWithLowGrades');
it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(<HomeInsights {...props} />, el);
});