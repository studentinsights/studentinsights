import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import moment from 'moment';
import {studentProfile} from './fixtures';
import NoteCard from './NoteCard';


const helpers = {
  renderInto: function(el, props) {
    const mergedProps = {
      noteMoment: moment(),
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

  editNoteAndSave: function(el, uiParams) {
    const $text = $(el).find('.EditableTextComponent');
    $text.html(uiParams.html);
    ReactTestUtils.Simulate.input($text.get(0));
    ReactTestUtils.Simulate.blur($text.get(0));
    return $text.html();
  },

  getNoteHTML: function(el) {
    return $(el).find('.EditableTextComponent').html();
  }
};

describe('render', () => {
  it('renders simple text', function() {
    const el = document.createElement('div');
    helpers.renderInto(el, {
      text: 'hello'
    });

    expect(helpers.getNoteHTML(el)).toEqual('hello');
  });

  it('renders number of revisions', function() {
    const el = document.createElement('div');
    helpers.renderInto(el, {
      text: 'hello',
      numberOfRevisions: 1
    });

    expect($(el).text()).toContain('Revised 1 time');
  });

  it('escapes HTML-meaningful characters in text', function() {
    const el = document.createElement('div');
    helpers.renderInto(el, {
      text: 'hello <script src="xss.js"></script>world'
    });

    expect(helpers.getNoteHTML(el)).toEqual('hello &lt;script src="xss.js"&gt;&lt;/script&gt;world');
  });

  it('renders newlines as <br> tags', function() {
    const el = document.createElement('div');
    helpers.renderInto(el, {
      text: 'hello\nworld'
    });

    expect(helpers.getNoteHTML(el)).toEqual('hello<br>world');
  });
});

describe('integration tests', () => {
  it('replaces HTML with newlines in saved text', function() {
    const el = document.createElement('div');
    const component = helpers.renderInto(el, {
      text: 'hello world'
    });

    helpers.editNoteAndSave(el, {
      html: 'hello<div><br></div>world'
    });

    expect(component.props.onSave).toHaveBeenCalledWith({
      id: component.props.eventNoteId,
      eventNoteTypeId: component.props.eventNoteTypeId,
      text: 'hello\nworld'
    });
  });

  it('sanitizes undesirable HTML', function() {
    const el = document.createElement('div');
    const component = helpers.renderInto(el, {
      text: 'hello\nworld'
    });

    helpers.editNoteAndSave(el, {
      html: 'hello<br><blink>world</blink>'
    });

    expect(component.props.onSave).toHaveBeenCalledWith({
      id: component.props.eventNoteId,
      eventNoteTypeId: component.props.eventNoteTypeId,
      text: 'hello\nworld'
    });
    expect(helpers.getNoteHTML(el)).toEqual('hello<br>world');
  });
});