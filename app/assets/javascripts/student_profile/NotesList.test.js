import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import {studentProfile, feedForTestingNotes} from './fixtures/fixtures';
import moment from 'moment';
import NotesList from './NotesList';


function testProps(props = {}) {
  return {
    feed: feedForTestingNotes,
    educatorsIndex: studentProfile.educatorsIndex,
    onSaveNote: jest.fn(),
    onEventNoteAttachmentDeleted: jest.fn(),
    ...props
  };
}

function testPropsForRestrictedNote(props = {}) {
  return testProps({
    feed: {
      transition_notes: [],
      services: {
        active: [],
        discontinued: []
      },
      deprecated: {
        interventions: []
      },
      event_notes: [{
        "id": 3,
        "student_id": 5,
        "educator_id": 1,
        "event_note_type_id": 301,
        "text": "RESTRICTED-this-is-the-note-text",
        "recorded_at": "2016-02-26T22:20:55.398Z",
        "created_at": "2016-02-26T22:20:55.416Z",
        "updated_at": "2016-02-26T22:20:55.416Z",
        "is_restricted": true,
        "event_note_revisions_count": 0,
        "attachments": [
          { id: 42, url: "https://www.example.com/studentwork" },
          { id: 47, url: "https://www.example.com/morestudentwork" }
        ]
      }]
    },
    ...props
  });
}

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(<NotesList {...props} />, el);
  return el;
}

function readNoteTimestamps(el) {
  return $(el).find('.NoteCard .date').toArray().map(dateEl => {
    return moment.parseZone($(dateEl).text(), 'MMM DD, YYYY').toDate().getTime();
  });
}

it('renders everything on the happy path', () => {
  const el = testRender(testProps());

  const noteTimestamps = readNoteTimestamps(el);
  expect(_.head(noteTimestamps)).toBeGreaterThan(_.last(noteTimestamps));
  expect(_.sortBy(noteTimestamps).reverse()).toEqual(noteTimestamps);
  expect($(el).find('.NoteCard').length).toEqual(5);

  expect(el.innerHTML).toContain('Behavior Plan');
  expect(el.innerHTML).toContain('Attendance Officer');
  expect(el.innerHTML).toContain('MTSS Meeting');
  expect(el.innerHTML).toContain('Transition note');
  expect(el.innerHTML).not.toContain('SST Meeting');

  // Notes attachments expectations
  expect(el.innerHTML).toContain("https://www.example.com/morestudentwork");
  expect(el.innerHTML).toContain("https://www.example.com/studentwork");
  expect(el.innerHTML).toContain("(remove)");
});

describe('props impacted restricted notes', () => {
  it('by default', () => {
    const el = testRender(testPropsForRestrictedNote());
    expect(el.innerHTML).not.toContain('RESTRICTED-this-is-the-note-text');
    expect(el.innerHTML).toContain('marked this note as restricted');
    expect(el.innerHTML).not.toContain('https://www.example.com/');
  });

  it('for my notes page', () => {
    const el = testRender(testPropsForRestrictedNote());
    expect(el.innerHTML).not.toContain('RESTRICTED-this-is-the-note-text');
    expect(el.innerHTML).not.toContain('https://www.example.com/');
    expect(el.innerHTML).toContain('marked this note as restricted');
  });

  it('for restricted notes page', () => {
    const el = testRender(testPropsForRestrictedNote({
      showRestrictedNoteContent: true,
      allowDirectEditingOfRestrictedNoteText: true
    }));
    expect(el.innerHTML).toContain('RESTRICTED-this-is-the-note-text');
    expect(el.innerHTML).toContain('https://www.example.com/');
    expect(el.innerHTML).not.toContain('marked this note as restricted');
    expect($(el).find('.EditableNoteText').length).toEqual(1);
  });
});
