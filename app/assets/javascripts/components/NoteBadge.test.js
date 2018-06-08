import React from 'react';
import ReactDOM from 'react-dom';
import NoteBadge from './NoteBadge';

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<NoteBadge eventNoteTypeId={305} />, el);
  expect(el.innerHTML).toContain('9th Grade Experience');
});

it('renders Other for unknown eventNoteTypeId', () => {
  const el = document.createElement('div');
  ReactDOM.render(<NoteBadge eventNoteTypeId={99999} />, el);
  expect(el.innerHTML).toContain('Other');
});
