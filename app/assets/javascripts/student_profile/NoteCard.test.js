import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import {studentProfile} from './fixtures/fixtures';
import {withDefaultNowContext} from '../testing/NowContainer';
import changeTextValue from '../testing/changeTextValue';
import NoteCard from './NoteCard';


function testProps(props = {}) {
  return {
    noteMoment: moment.utc('2018-02-22T08:22:22.123Z'),
    educatorId: 1,
    badge: <span>
      {''}
    </span>,
    onSave: jest.fn(),
    eventNoteId: 1,
    eventNoteTypeId: 1,
    educatorsIndex: studentProfile.educatorsIndex,
    attachments: [],
    ...props
  };
}

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<NoteCard {...props} />), el); //eslint-disable-line react/no-render-return-value
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
