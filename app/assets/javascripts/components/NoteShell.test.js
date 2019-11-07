import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import NoteShell from './NoteShell';


function testProps(props = {}) {
  return {
    whenEl: 'when!',
    badgeEl: 'what!',
    educatorEl: 'who!',
    substanceEl: <div className="test-substacne">substance</div>,
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<NoteShell {...testProps()} />, el);
  expect(el.textContent).toContain('when!');
});

it('snapshots across all scenarios at once', () => {
  const el = <NoteShell {...testProps()} />;
  expect(renderer.create(el).toJSON()).toMatchSnapshot();
});
