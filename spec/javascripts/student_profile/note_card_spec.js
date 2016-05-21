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
    }
  };

  SpecSugar.withTestEl('high-level integration tests', function() {
    it('renders everything on the happy path', function() {
      var el = this.testEl;

      helpers.renderInto(el, {
        text: 'hello'
      });

      expect($(el).find('.note-text').html()).toEqual('hello');
    });

    it('sanitizes unsafe HTML', function() {
      var el = this.testEl;

      helpers.renderInto(el, {
        text: 'hello <script src="xss.js"></script>world'
      });

      expect($(el).find('.note-text').html())
        .toEqual('hello &lt;script src="xss.js"&gt;&lt;/script&gt;world');
    });
  });
});
