import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import renderer from 'react-test-renderer';
import fetchMock from 'fetch-mock/es5/client';
import RestrictedNotePresence from './RestrictedNotePresence';


export function testProps(props = {}) {
  return {
    eventNoteId: 42,
    studentFirstName: 'Cassandra',
    educatorName: 'Darnell',
    allowViewing: false,
    ...props
  };
}

export function mockFetch() {
  fetchMock.restore();
  fetchMock.get('express:/api/event_notes/:id/restricted_note_json', {
    text: 'RESTRICTED-text',
    event_note_attachments: [{url: 'https://website.com/RESTRICTED-url'}]
  });
}

function testEl(props = {}) {
  return <RestrictedNotePresence {...props} />;
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(testEl(props), el);
  expect(el.innerHTML).not.toContain('RESTRICTED-text');
});

it('allows viewing', done => {
  mockFetch();
  const props = testProps({allowViewing: true});
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

it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(testEl(props))
    .toJSON();
  expect(tree).toMatchSnapshot();
});
