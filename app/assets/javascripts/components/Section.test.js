import React from 'react';
import ReactDOM from 'react-dom';
import Section from './Section';

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(
    <Section
      id={321}
      sectionNumber="101"
      courseDescription="ALGEBRA 2" />
  , el);
});
