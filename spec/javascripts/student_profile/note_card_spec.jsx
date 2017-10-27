import {studentProfile} from './fixtures.jsx';
import SpecSugar from '../support/spec_sugar.jsx';
import moment from 'moment';
import ReactTestUtils from 'react-addons-test-utils';


describe('NoteCard', function() {
  const merge = window.shared.ReactHelpers.merge;
  const ReactDOM = window.ReactDOM;
  const NoteCard = window.shared.NoteCard;

  const helpers = {
    renderInto: function(el, props) {
      const mergedProps = merge(props || {}, {
        noteMoment: moment(),
        educatorId: 1,
        badge: <span>
          {''}
        </span>,
        onSave: jest.fn(),
        eventNoteId: 1,
        eventNoteTypeId: 1,
        educatorsIndex: studentProfile.educatorsIndex,
        attachments: []
      });

      return ReactDOM.render(<NoteCard {...mergedProps} />, el); //eslint-disable-line react/no-render-return-value
    },

    editNoteAndSave: function(el, uiParams) {
      const $text = $(el).find('.note-text');
      $text.html(uiParams.html);
      ReactTestUtils.Simulate.input($text.get(0));
      ReactTestUtils.Simulate.blur($text.get(0));
      return $text.html();
    },

    getNoteHTML: function(el) {
      return $(el).find('.note-text').html();
    }
  };

  SpecSugar.withTestEl('render', function(container) {
    it('renders simple text', function() {
      const el = container.testEl;

      helpers.renderInto(el, {
        text: 'hello'
      });

      expect(helpers.getNoteHTML(el)).toEqual('hello');
    });

    it('renders number of revisions', function() {
      const el = container.testEl;

      helpers.renderInto(el, {
        text: 'hello',
        numberOfRevisions: 1
      });

      expect($(el).text()).toContain('Revised 1 time');
    });

    it('escapes HTML-meaningful characters in text', function() {
      const el = container.testEl;

      helpers.renderInto(el, {
        text: 'hello <script src="xss.js"></script>world'
      });

      expect(helpers.getNoteHTML(el)).toEqual('hello &lt;script src="xss.js"&gt;&lt;/script&gt;world');
    });

    it('renders newlines as <br> tags', function() {
      const el = container.testEl;

      helpers.renderInto(el, {
        text: 'hello\nworld'
      });

      expect(helpers.getNoteHTML(el)).toEqual('hello<br>world');
    });
  });

  SpecSugar.withTestEl('integration tests', function(container) {
    it('replaces HTML with newlines in saved text', function() {
      const el = container.testEl;

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
      const el = container.testEl;

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
});
