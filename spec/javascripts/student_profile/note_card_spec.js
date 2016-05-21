//= require ./fixtures

describe('NoteCard', function() {
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var SpecSugar = window.shared.SpecSugar;
  var NoteCard = window.shared.NoteCard;
  var Fixtures = window.shared.Fixtures;
  var moment = window.moment;

  var helpers = {
    renderInto: function(el, props) {
      var mergedProps = merge(props || {}, {
        noteMoment: moment(),
        educatorId: 1,
        badge: dom.span({}, ''),
        onSave: jasmine.createSpy('onSave'),
        eventNoteId: 1,
        eventNoteTypeId: 1,
        educatorsIndex: Fixtures.studentProfile.educatorsIndex
      });

      return ReactDOM.render(createEl(NoteCard, mergedProps), el);
    },

    editNoteAndSave: function(el, uiParams) {
      var $text = $(el).find('.note-text');
      $text.html(uiParams.html);
      React.addons.TestUtils.Simulate.input($text.get(0));
      React.addons.TestUtils.Simulate.blur($text.get(0));
      return $text.html();
    },

    getNoteHTML: function(el) {
      return $(el).find('.note-text').html();
    }
  };

  SpecSugar.withTestEl('render', function() {
    it('renders simple text', function() {
      var el = this.testEl;

      helpers.renderInto(el, {
        text: 'hello'
      });

      expect(helpers.getNoteHTML(el)).toEqual('hello');
    });

    it('escapes HTML-meaningful characters in text', function() {
      var el = this.testEl;

      helpers.renderInto(el, {
        text: 'hello <script src="xss.js"></script>world'
      });

      expect(helpers.getNoteHTML(el)).toEqual('hello &lt;script src="xss.js"&gt;&lt;/script&gt;world');
    });

    it('renders newlines as <br> tags', function() {
      var el = this.testEl;

      helpers.renderInto(el, {
        text: 'hello\nworld'
      });

      expect(helpers.getNoteHTML(el)).toEqual('hello<br>world');
    });
  });

  SpecSugar.withTestEl('integration tests', function() {
    it('replaces HTML with newlines in saved text', function() {
      var el = this.testEl;

      var component = helpers.renderInto(el, {
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
      var el = this.testEl;

      var component = helpers.renderInto(el, {
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
