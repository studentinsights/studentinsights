import React from 'react';
import ReactDOM from 'react-dom';
import {studentProfile} from './fixtures/fixtures';
import {testTimeMoment} from '../testing/NowContainer';
import changeTextValue from '../testing/changeTextValue';
import NoteCard from './NoteCard';


const helpers = {
  renderInto(el, props) {
    const mergedProps = {
      noteMoment: testTimeMoment(),
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

    return ReactDOM.render(<NoteCard {...mergedProps} />, el); //eslint-disable-line react/no-render-return-value
  },

  editNoteText(el, text) {
    const $text = $(el).find('.ResizingTextArea');
    changeTextValue($text.get(0), text);
  },

  getNoteHTML(el) {
    return $(el).find('.ResizingTextArea').html();
  }
};

describe('render', () => {
  it('renders simple text', () => {
    const el = document.createElement('div');
    helpers.renderInto(el, {
      text: 'hello'
    });

    expect(helpers.getNoteHTML(el)).toEqual('hello');
  });

  it('renders number of revisions', () => {
    const el = document.createElement('div');
    helpers.renderInto(el, {
      text: 'hello',
      numberOfRevisions: 1
    });

    expect($(el).text()).toContain('Revised 1 time');
  });

  it('escapes HTML-meaningful characters in text', () => {
    const el = document.createElement('div');
    helpers.renderInto(el, {
      text: 'hello <script src="xss.js"></script>world'
    });

    expect(helpers.getNoteHTML(el)).toEqual('hello &lt;script src="xss.js"&gt;&lt;/script&gt;world');
  });

  it('renders newlines', () => {
    const el = document.createElement('div');
    helpers.renderInto(el, {
      text: 'hello\nworld'
    });

    expect(helpers.getNoteHTML(el)).toEqual("hello\nworld");
  });
});

describe('saving', () => {
  it('works in simple case', () => {
    const el = document.createElement('div');
    const component = helpers.renderInto(el, { text: 'hello' });
    helpers.editNoteText(el, 'hello world');

    expect(component.props.onSave).toHaveBeenCalledWith({
      id: component.props.eventNoteId,
      eventNoteTypeId: component.props.eventNoteTypeId,
      text: 'hello world'
    });
  });
});
