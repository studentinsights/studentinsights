import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import _ from 'lodash';
import moment from 'moment';
import {IDLE, PENDING, ERROR} from '../helpers/requestStates';
import {studentProfile} from './fixtures/fixtures';
import {withDefaultNowContext} from '../testing/NowContainer';
import changeTextValue from '../testing/changeTextValue';
import NoteCard from './NoteCard';


export function testProps(props = {}) {
  return {
    noteMoment: moment.utc('2018-02-22T08:22:22.123Z'),
    educatorId: 1,
    badge: <span>[props.badge]</span>,
    onSave: jest.fn(),
    eventNoteId: 111,
    eventNoteTypeId: 300,
    educatorsIndex: studentProfile.educatorsIndex,
    attachments: [],
    requestState: IDLE,
    ...props
  };
}

// Different scenarios for test/story
export function testScenarios() {
  const attachments = [{id: 789, url: 'https://example.com/foo-is-a-really-long-fake-url-path-like-a-unique-doc-id-link'}];
  const urlForRestrictedNoteContent = '/mocked-url-for-restricted-note-content';

  const readonly = { onSave: null };
  const recentRevision = { lastRevisedAtMoment: moment.utc('2018-03-01T09:00:01.123Z') };
  const oldRevision  = { lastRevisedAtMoment: moment.utc('2016-12-19T19:19:19.123Z') };
  const readonlyAttachments = { attachments };

  const editable = { onSave: _.identity };
  const saving = { requestState: PENDING };
  const error = { requestState: ERROR };
  const removableAttachments = { attachments, onEventNoteAttachmentDeleted: _.identity };

  const redacted = { showRestrictedNoteRedaction: true };
  const canShowRedacted = { urlForRestrictedNoteContent };
  

  return [
    { label: 'kitchen sink!', propsDiff: {...editable,...removableAttachments,...error,...recentRevision} },


    { label: 'readonly', propsDiff: {...readonly} },
    { label: 'readonly, recentRevision', propsDiff: {...readonly, ...recentRevision} },
    { label: 'readonly, oldRevision', propsDiff: {...readonly, ...oldRevision} },
    { label: 'readonly, readonlyAttachments', propsDiff: {...readonly, ...readonlyAttachments} },

    { label: 'editable', propsDiff: {...editable} },
    { label: 'editable, recentRevision', propsDiff: {...editable, ...recentRevision} },
    { label: 'editable, oldRevision', propsDiff: {...editable, ...oldRevision} },
    { label: 'editable, readonlyAttachments', propsDiff: {...editable, ...readonlyAttachments} },
    { label: 'editable, removableAttachments', propsDiff: {...editable, ...removableAttachments} },
    { label: 'editable, saving', propsDiff: {...editable, ...saving} },
    { label: 'editable, error', propsDiff: {...editable, ...error} },

    { label: 'redacted', propsDiff: {...redacted} },
    { label: 'redacted, recentRevision', propsDiff: {...redacted, ...recentRevision} },
    { label: 'redacted, oldRevision', propsDiff: {...redacted, ...oldRevision} },
    { label: 'redacted, readonlyAttachments', propsDiff: {...redacted, ...readonlyAttachments} },
    { label: 'redacted, removableAttachments', propsDiff: {...redacted, ...removableAttachments} },
    { label: 'redacted, canShowRedacted, urlForRestrictedNoteContent', propsDiff: {...redacted, ...canShowRedacted, ...urlForRestrictedNoteContent} },

    { label: 'buggy call, editable, redacted', propsDiff: {...editable,...redacted} }
  ];
}

function testEl(props) {
  return withDefaultNowContext(<NoteCard {...props} />);
}

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(testEl(props), el); //eslint-disable-line react/no-render-return-value
  return {el};
}

function editNoteText(el, text) {
  const $text = $(el).find('.ResizingTextArea');
  changeTextValue($text.get(0), text);
}

function getNoteHTML(el) {
  return $(el).find('.ResizingTextArea').html();
}


describe('render', () => {
  it('renders simple text', () => {
    const {el} = testRender(testProps({
      text: 'hello'
    }));
    expect(getNoteHTML(el)).toEqual('hello');
    expect($(el).text()).not.toContain('Revised');
  });

  it('renders revision date for old revisions', () => {
    const {el} = testRender(testProps({
      text: 'hello',
      lastRevisedAtMoment: moment.utc('2018-03-01T09:00:01.123Z'),
    }));
    expect($(el).text()).toContain('Revised 12 days ago');
  });

  it('renders how long ago for recent revisions', () => {
    const {el} = testRender(testProps({
      text: 'hello',
      lastRevisedAtMoment: moment.utc('2017-11-11T11:00:01.123Z'),
    }));
    expect($(el).text()).toContain('Revised on 11/11/17');
  });

  it('escapes HTML-meaningful characters in text', () => {
    const {el} = testRender(testProps({
      text: 'hello <script src="xss.js"></script>world'
    }));
    expect(getNoteHTML(el)).toEqual('hello &lt;script src="xss.js"&gt;&lt;/script&gt;world');
  });

  it('renders newlines', () => {
    const {el} = testRender(testProps({
      text: 'hello\nworld'
    }));
    expect(getNoteHTML(el)).toEqual("hello\nworld");
  });
});

describe('saving', () => {
  it('works in simple case', done => {
    const props = testProps({text: 'hello'});
    const {el} = testRender(props);
    editNoteText(el, 'hello world');

    // wait for debounce
    setTimeout(() => {
      expect(props.onSave).toHaveBeenCalledWith({
        id: props.eventNoteId,
        eventNoteTypeId: props.eventNoteTypeId,
        text: 'hello world'
      });
      done();
    }, 600);
  });
});


describe('snapshots across scenarios', () => {
  const el = testScenarios().map(scenario => (
    <div key={scenario.label}>
      <h3>scenario for snapshot: {scenario.label}</h3>
      {testEl(testProps({text: 'hello!', ...scenario.propsDiff}))}
    </div>
  ));
  expect(renderer.create(el).toJSON()).toMatchSnapshot();
});
