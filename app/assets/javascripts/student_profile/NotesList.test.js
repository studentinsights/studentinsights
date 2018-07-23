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

function readNoteTimestamps(el) {
  return $(el).find('.NoteCard .date').toArray().map(dateEl => {
    return moment.parseZone($(dateEl).text(), 'MMM DD, YYYY').toDate().getTime();
  });
}

it.only('renders everything on the happy path', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(<NotesList {...props} />, el);

  const noteTimestamps = readNoteTimestamps(el);
  expect(_.first(noteTimestamps)).toBeGreaterThan(_.last(noteTimestamps));
  expect(_.sortBy(noteTimestamps).reverse()).toEqual(noteTimestamps);
  expect($(el).find('.NoteCard').length).toEqual(4);
  expect(el.innerHTML).toContain('Behavior Plan');
  expect(el.innerHTML).toContain('Attendance Officer');
  expect(el.innerHTML).toContain('MTSS Meeting');

  expect(el.innerHTML).not.toContain('SST Meeting');

  // Notes attachments expectations
  expect(el.innerHTML).toContain("https://www.example.com/morestudentwork");
  expect(el.innerHTML).toContain("https://www.example.com/studentwork");
  expect(el.innerHTML).toContain("(remove)");
});
