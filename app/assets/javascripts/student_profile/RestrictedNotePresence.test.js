import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import renderer from 'react-test-renderer';
import fetchMock from 'fetch-mock/es5/client';
import RestrictedNotePresence from './RestrictedNotePresence';


export function testProps(props = {}) {
  return {
    studentFirstName: 'Cassandra',
    educatorName: 'Darnell',
    urlForRestrictedNoteContent: null,
    ...props
  };
}

export function mockFetch() {
  fetchMock.restore();
  fetchMock.get('express:/api/event_notes/:id/restricted_note_json', {
    text: 'RESTRICTED-text',
    event_note_attachments: [{url: 'https://website.com/RESTRICTED-url'}]
  });
  fetchMock.get('express:/api/students/:student_id/restricted_transition_note_json', {
    text: 'RESTRICTED-transition-note-text'
  });
}

function testEl(props = {}) {
  return <RestrictedNotePresence {...props} />;
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(testEl(props), el);
  expect(el.innerHTML).not.toContain('RESTRICTED');
});

it('allows viewing by EventNote URL', done => {
  mockFetch();
  const urlForRestrictedNoteContent = '/api/event_notes/42/restricted_note_json';
  const props = testProps({urlForRestrictedNoteContent});
  const el = document.createElement('div');
  ReactDOM.render(testEl(props), el);
  expect(el.innerHTML).toContain('show restricted note');

  ReactTestUtils.Simulate.click($(el).find('a').get(0));
  setTimeout(() => {
    expect(el.innerHTML).not.toContain('show restricted note');
    expect(el.innerHTML).toContain('RESTRICTED-text');
    expect(el.innerHTML).toContain('This is a restricted note');
    done();
  }, 0);
});

it('allows viewing TransitionNote', done => {
  mockFetch();
  const urlForRestrictedNoteContent = '/api/students/73/restricted_transition_note_json';
  const props = testProps({urlForRestrictedNoteContent});
  const el = document.createElement('div');
  ReactDOM.render(testEl(props), el);
  expect(el.innerHTML).toContain('show restricted note');

  ReactTestUtils.Simulate.click($(el).find('a').get(0));
  setTimeout(() => {
    expect(el.innerHTML).not.toContain('show restricted note');
    expect(el.innerHTML).toContain('RESTRICTED-transition-note-text');
    expect(el.innerHTML).toContain('This is a restricted note');
    done();
  }, 0);
});

it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(testEl(props))
    .toJSON();
  expect(tree).toMatchSnapshot();
});
