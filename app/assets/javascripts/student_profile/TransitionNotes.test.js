import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import TransitionNotes from './TransitionNotes';

function testProps(props) {
  return {
    readOnly: false,
    onSave: jest.fn(),
    defaultTransitionNotes: [],
    requestState: null,
    requestStateRestricted: null,
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<TransitionNotes {...testProps()} />, el);
  expect(el.innerHTML).toContain('High School Transition Note');
  expect(el.innerHTML).toContain('High School Transition Note (Restricted)');
});

it('snapshots view', () => {
  const tree = renderer
    .create(<TransitionNotes {...testProps()} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});