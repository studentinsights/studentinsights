import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import ReadingThresholdsPage from './ReadingThresholdsPage';


it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<ReadingThresholdsPage />, el);
});

it('snapshots', () => {
  const tree = renderer
    .create(<ReadingThresholdsPage />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
