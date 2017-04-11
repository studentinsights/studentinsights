//= require ./fixtures

describe('NotesList', function() {
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var SpecSugar = window.shared.SpecSugar;
  var NotesList = window.shared.NotesList;
  var Fixtures = window.shared.Fixtures;

  var helpers = {
    renderInto: function(el, props) {
      var mergedProps = merge(props || {}, {
        feed: Fixtures.feedForTestingNotes,
        educatorsIndex: Fixtures.studentProfile.educatorsIndex,
        eventNoteTypesIndex: Fixtures.studentProfile.eventNoteTypesIndex,
        onSaveNote: jasmine.createSpy('onSaveNote'),
        onEventNoteAttachmentDeleted: jasmine.createSpy('onEventNoteAttachmentDeleted')
      });
      return ReactDOM.render(createEl(NotesList, mergedProps), el);
    },

    noteTimestamps: function(el) {
      return $(el).find('.NoteCard .date').toArray().map(function(dateEl) {
        return moment.parseZone($(dateEl).text(), 'MMM DD, YYYY').toDate().getTime();
      });
    }
  };

  SpecSugar.withTestEl('high-level integration tests', function() {
    it('renders everything on the happy path', function() {
      var el = this.testEl;
      helpers.renderInto(el);

      var noteTimestamps = helpers.noteTimestamps(el);
      expect(_.first(noteTimestamps)).toBeGreaterThan(_.last(noteTimestamps));
      expect(_.sortBy(noteTimestamps).reverse()).toEqual(noteTimestamps);
      expect($(el).find('.NoteCard').length).toEqual(4);
      expect(el).toContainText('Behavior Plan');
      expect(el).toContainText('Attendance Officer');
      expect(el).toContainText('MTSS Meeting');

      expect(el).not.toContainText('SST Meeting');

      // Notes attachments expectations
      expect(el).toContainText("link: https://www.example.com/morestudentwork");
      expect(el).toContainText("link: https://www.example.com/studentwork");
      expect(el).toContainText("(remove)");
    });
  });
});
