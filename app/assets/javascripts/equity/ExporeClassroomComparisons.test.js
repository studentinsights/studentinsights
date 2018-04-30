import React from 'react';
import ReactDOM from 'react-dom';
import ExploreClassroomComparisons from './ExploreClassroomComparisons';

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<ExploreClassroomComparisons students={[]} />, el);
});
