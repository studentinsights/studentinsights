import React from 'react';
import ReactDOM from 'react-dom';
import StudentPhotoCropped from './StudentPhotoCropped';
import renderer from 'react-test-renderer';


it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<StudentPhotoCropped studentId={42} />, el);
});

it('snapshots', () => {
  const tree = renderer
    .create(<StudentPhotoCropped studentId={42} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
