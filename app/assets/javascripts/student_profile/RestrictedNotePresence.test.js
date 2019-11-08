import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import fetchMock from 'fetch-mock/es5/client';
import RestrictedNotePresence, {
  fetchRestrictedTransitionNoteText,
  fetchRestrictedNoteText
} from './RestrictedNotePresence';


export function testProps(props = {}) {
  return {
    studentFirstName: 'Cassandra',
    educatorName: 'Darnell',
    fetchRestrictedText: null,
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
  expect(el.textContent).not.toContain('RESTRICTED');
});

it('works with fetchRestrictedNoteText', done => {
  mockFetch();
  const fetchRestrictedText = () => fetchRestrictedNoteText({id: 42 });
  const props = testProps({fetchRestrictedText});
  const el = document.createElement('div');
  ReactDOM.render(testEl(props), el);
  expect(el.textContent).toContain('show restricted note');

  ReactTestUtils.Simulate.click($(el).find('a').get(0));
  setTimeout(() => {
    expect(el.textContent).not.toContain('show restricted note');
    expect(el.textContent).toContain('RESTRICTED-text');
    expect(el.textContent).toContain('This is a restricted note');
    done();
  }, 0);
});

it('works with fetchRestrictedTransitionNoteText', done => {
  mockFetch();
  const fetchRestrictedText = () => fetchRestrictedTransitionNoteText({student_id: 63 });
  const props = testProps({fetchRestrictedText});
  const el = document.createElement('div');
  ReactDOM.render(testEl(props), el);
  expect(el.textContent).toContain('show restricted note');

  ReactTestUtils.Simulate.click($(el).find('a').get(0));
  setTimeout(() => {
    expect(el.textContent).not.toContain('show restricted note');
    expect(el.textContent).toContain('RESTRICTED-transition-note-text');
    expect(el.textContent).toContain('This is a restricted note');
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
