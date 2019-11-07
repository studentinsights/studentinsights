import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import _ from 'lodash';
import moment from 'moment';
import {studentProfile, feedForTestingNotes} from './fixtures/fixtures';
import {withDefaultNowContext} from '../testing/NowContainer';
import {createRequestsState} from './PageContainer.mocks';
import NotesList from './NotesList';


function testProps(props = {}) {
  return {
    currentEducator: studentProfile.educatorsIndex[1],
    student: studentProfile.student,
    feed: feedForTestingNotes,
    educatorsIndex: studentProfile.educatorsIndex,
    onSaveNote: jest.fn(),
    onEventNoteAttachmentDeleted: jest.fn(),
    requests: createRequestsState(),
    ...props
  };
}

function feedWithEventNotesJson(eventNotesJson) {
  return {
    transition_notes: [],
    homework_help_sessions: [],
    bedford_end_of_year_transitions: [],
    second_transition_notes: [],
    services: {
      active: [],
      discontinued: []
    },
    deprecated: {
      interventions: []
    },
    event_notes: eventNotesJson
  };
}

function testPropsForRestrictedNote(props = {}) {
  return testProps({
    feed: feedWithEventNotesJson([{
      "id": 3,
      "student_id": 5,
      "educator_id": 1,
      "event_note_type_id": 301,
      "text": "RESTRICTED-this-is-the-note-text",
      "recorded_at": "2018-02-26T22:20:55.398Z",
      "created_at": "2018-02-26T22:20:55.416Z",
      "updated_at": "2018-02-26T22:20:55.416Z",
      "is_restricted": true,
      "event_note_revisions_count": 0,
      "attachments": [
        { id: 42, url: "https://www.example.com/studentwork" },
        { id: 47, url: "https://www.example.com/morestudentwork" }
      ]
    }]),
    ...props
  });
}

function testPropsForHomeworkHelp(props = {}) {
  return testProps({
    feed: {
      ...feedWithEventNotesJson([]),
      homework_help_sessions: [{
        "id": 5,
        "student_id": 5,
        "form_timestamp": "2018-09-25T13:41:43.000Z",
        "recorded_by_educator_id": 1,
        "courses": [
          {
            "id": 4,
            "course_number": "111",
            "course_description": "US HISTORY 1 HONORS"
          },
          {
            "id": 5,
            "course_number": "212",
            "course_description": "ALGEBRA 1 CP"
          }
        ]
      }]
    },
    ...props
  });
}

function testPropsForSecondTransitionNotes(props = {}) {
  return testProps({
    feed: {
      ...feedWithEventNotesJson([]),
      second_transition_notes: [{
        id: 42,
        created_at: '2017-05-18T14:31:29.113Z',
        updated_at: '2017-05-18T14:31:29.113Z',
        educator_id: 1,
        student_id: 1,
        form_key: 'somerville_8th_to_9th_grade',
        form_json: {
          strengths: '...strengths...',
          connecting: '...connecting...',
          community: '...community...',
          peers: '...peers...',
          family: '...family...',
          other: '...other...',
        },
        starred: true,
        recorded_at: '2019-05-18T14:31:29.102Z',
        has_restricted_text: true
      }]
    },
    ...props
  });
}

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<NotesList {...props} />), el);
  return el;
}

function readNoteTimestamps(el) {
  return $(el).find('.NoteShell .date').toArray().map(dateEl => {
    return moment.parseZone($(dateEl).text(), 'MMM DD, YYYY').toDate().getTime();
  });
}

it('with full historical data, renders everything on the happy path', () => {
  const el = testRender(testProps({
    defaultSchoolYearsBack: {
      number: 20,
      textYears: 'twenty years'
    }
  }));

  const noteTimestamps = readNoteTimestamps(el);
  expect(_.head(noteTimestamps)).toBeGreaterThan(_.last(noteTimestamps));
  expect(_.sortBy(noteTimestamps).reverse()).toEqual(noteTimestamps);
  expect($(el).find('.NoteShell').length).toEqual(5);

  expect(el.textContent).toContain('Behavior Plan');
  expect(el.textContent).toContain('Attendance Officer');
  expect(el.textContent).toContain('MTSS Meeting');
  expect(el.textContent).toContain('Transition note');
  expect(el.textContent).not.toContain('SST Meeting');

  // Notes attachments expectations
  expect(el.textContent).toContain("https://www.example.com/morestudentwork");
  expect(el.textContent).toContain("https://www.example.com/studentwork");
  expect(el.textContent).toContain("remove");
});

it('limits visible notes by default', () => {
  const el = testRender(testProps());
  expect($(el).find('.NoteShell').length).toEqual(1);
  expect($(el).find('.CleanSlateMessage').length).toEqual(1);
});

it('allows anyone to click and see older notes', () => {
  const el = testRender(testProps());
  expect($(el).find('.NoteShell').length).toEqual(1);
  ReactTestUtils.Simulate.click($(el).find('.CleanSlateMessage a').get(0));
  expect($(el).find('.NoteShell').length).toEqual(5);
});

it('allows editing a note you wrote', () => {
  const el = testRender(testProps({
    currentEducator: {
      id: 1
    },
    feed: feedWithEventNotesJson([{
      "id": 3,
      "student_id": 5,
      "educator_id": 1,
      "event_note_type_id": 301,
      "text": "hello-text",
      "recorded_at": "2018-02-26T22:20:55.398Z",
      "created_at": "2018-02-26T22:20:55.416Z",
      "updated_at": "2018-02-26T22:20:55.416Z",
      "is_restricted": false,
      "event_note_revisions_count": 0,
      "attachments": []
    }]
    )}));
  expect($(el).find('.NoteText').length).toEqual(0);
  expect($(el).find('.EditableNoteText').length).toEqual(1);
});

it('does not allow editing notes written by someone else', () => {
  const el = testRender(testProps({
    currentEducator: {
      id: 999
    },
    feed: feedWithEventNotesJson([{
      "id": 3,
      "student_id": 5,
      "educator_id": 1,
      "event_note_type_id": 301,
      "text": "hello-text",
      "recorded_at": "2018-02-26T22:20:55.398Z",
      "created_at": "2018-02-26T22:20:55.416Z",
      "updated_at": "2018-02-26T22:20:55.416Z",
      "is_restricted": false,
      "event_note_revisions_count": 0,
      "attachments": []
    }]
    )}));
  expect($(el).find('.NoteText').length).toEqual(1);
  expect($(el).find('.EditableNoteText').length).toEqual(0);
});

describe('props impacting restricted notes', () => {
  it('by default', () => {
    const el = testRender(testPropsForRestrictedNote());
    expect(el.textContent).not.toContain('RESTRICTED-this-is-the-note-text');
    expect(el.textContent).toContain('marked this note as restricted');
    expect(el.textContent).not.toContain('https://www.example.com/');
  });

  it('for my notes page', () => {
    const el = testRender(testPropsForRestrictedNote());
    expect(el.textContent).not.toContain('RESTRICTED-this-is-the-note-text');
    expect(el.textContent).not.toContain('https://www.example.com/');
    expect(el.textContent).toContain('marked this note as restricted');
  });
});


describe('homework help', () => {
  it('works on happy path', () => {
    const el = testRender(testPropsForHomeworkHelp());
    expect($(el).find('.NoteText').length).toEqual(1);
    expect($(el).find('.EditableNoteText').length).toEqual(0);
    expect($(el).text()).toContain('Homework Help');
    expect($(el).find('.NoteText').text()).toEqual('Went to homework help for US HISTORY 1 HONORS and ALGEBRA 1 CP.');
  });
});

describe('flattened forms', () => {
  it('works on happy path', () => {
    const el = testRender(testProps({
      feed: {
        ...feedWithEventNotesJson([]),
        flattened_forms: [{
          "id": 5,
          "student_id": 5,
          "form_title": "What I want my teachers to know",
          "form_timestamp": "2018-09-25T13:41:43.000Z",
          "educator_id": 1,
          "text": "<text>"
        }]
      }
    }));
    expect($(el).find('.NoteText').length).toEqual(1);
    expect($(el).find('.EditableNoteText').length).toEqual(0);
    expect($(el).text()).toContain('What I want my teachers to know');
    expect($(el).find('.NoteShell a').length).toEqual(0);
    expect($(el).find('.NoteText').text()).toEqual('💬 From the "What I want my teachers to know" student voice survey 💬\n\n<text>');
  });
});

it('works for Bedford transition notes', () => {
  const el = testRender(testProps({
    feed: {
      ...feedWithEventNotesJson([]),
      bedford_end_of_year_transitions: [{
        "id": 3,
        "student_id": 5,
        "form_timestamp": "2018-03-13T11:03:00.000Z",
        "form_key": "bedford_end_of_year_transition_one",
        "form_url": "https://example.com/form_url",
        "form_json": {
          "LLI": "yes",
          "Reading Intervention (w/ specialist)": null,
          "Math Intervention (w/ consult from SD)": "yes",
          "Please share any specific information you want the teacher to know beyond the report card. This could include notes on interventions, strategies, academic updates that aren't documented in an IEP or 504. If information is in a file please be sure to link it here or share w/ Jess via google doc folder or paper copy": "Nov- Dec: 3x30 1:4 pull out Reading group (PA and fundations)",
          "Is there any key information that you wish you knew about this student in September?": null,
          "Please share anything that helped you connect with this student that might be helpful to the next teacher.": "Garfield enjoyed sharing special time reading together for a few minutes at the end of the day."
        },
        "educator_id": 2,
        "created_at": "2016-05-30T17:09:26.029Z",
        "updated_at": "2016-05-30T17:25:17.623Z",
        "educator": {
          "id": 2,
          "email": "vivian@demo.studentinsights.org",
          "full_name": "Teacher, Vivian"
        }
      }]
    }
  }));
  expect($(el).find('.BedfordTransitionSubstanceForProfile').length).toEqual(1);
  expect($(el).find('.EditableNoteText').length).toEqual(0);
  expect($(el).text()).toContain('Transition information');
});

describe('second transition notes, inline', () => {
  it('works on happy path', () => {
    const props = testPropsForSecondTransitionNotes();
    const el = testRender(props);
    expect($(el).find('.SecondTransitionNoteInline').length).toEqual(1);
    expect($(el).find('.NoteText:eq(0)').text()).toEqual([
      "What are Daisy's strengths?",
      "...strengths...",
      '',
      "What works well for connecting with Daisy?",
      "...connecting...",
      '',
      "How does Daisy relate to their peers?",
      "...community...",
      '',
      "How has Daisy become involved with the school community?",
      "...peers...",
      '',
      "What works well for communicating with Daisy’s family?",
      "...family...",
      '',
      "Any additional comments or good things to know?",
      "...other..."
    ].join("\n"));
    expect($(el).text()).toContain('What other services does Daisy receive now, and who are the points of contact (eg, social workers, mental health counselors)?');
    expect($(el).find('.RestrictedNotePresence').length).toEqual(1);
  });

  it('includes link for restricted note when canUserAccessRestrictedNotes', () => {
    const props = testPropsForSecondTransitionNotes({
      canUserAccessRestrictedNotes: true
    });
    const el = testRender(props);
    expect($(el).find('.RestrictedNotePresence a').text()).toEqual('show restricted note');
  });
});
