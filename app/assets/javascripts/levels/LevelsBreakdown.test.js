import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import LevelsBreakdown from './LevelsBreakdown';
import levelsShowJson from './levelsShowJson.fixture';

function testProps(props) {
  return {
    studentsWithLevels: levelsShowJson.students_with_levels,
    messageEl: <div>message!</div>,
    levelsLinksEl: <div>links!</div>,
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<LevelsBreakdown {...testProps()} />, el);
  expect(el.innerHTML).toContain('message!');
  expect(el.innerHTML).toContain('links!');
});

it('snapshots view', () => {
  const tree = renderer
    .create(<LevelsBreakdown {...testProps()} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});