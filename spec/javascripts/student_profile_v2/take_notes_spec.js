//= require ./fixtures

describe('TakeNotes', function() {
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var TakeNotes = window.shared.TakeNotes;
  var SpecSugar = window.shared.SpecSugar;
  var Fixtures = window.shared.Fixtures;
  var eventNotesFixture = [{"id":4,"student_id":24,"educator_id":1,"event_note_type_id":301,"text":"cool!","recorded_at":"2016-02-15T18:42:45.937Z","created_at":"2016-02-15T18:42:45.943Z","updated_at":"2016-02-15T18:42:45.943Z"},{"id":5,"student_id":24,"educator_id":1,"event_note_type_id":301,"text":"this tiss thie this tiss thie this tiss thie this tiss thie this tiss thie this tiss thie this tiss thie ","recorded_at":"2016-02-15T20:01:02.086Z","created_at":"2016-02-15T20:01:02.087Z","updated_at":"2016-02-15T20:01:02.087Z"},{"id":6,"student_id":24,"educator_id":1,"event_note_type_id":5,"text":"okay!","recorded_at":"2016-02-15T20:03:28.232Z","created_at":"2016-02-15T20:03:28.233Z","updated_at":"2016-02-15T20:03:28.233Z"},{"id":7,"student_id":24,"educator_id":1,"event_note_type_id":2,"text":"yep :)","recorded_at":"2016-02-15T20:03:36.699Z","created_at":"2016-02-15T20:03:36.700Z","updated_at":"2016-02-15T20:03:36.700Z"}];

  var helpers = {
    renderInto: function(el, props) {
      var mergedProps = merge(props || {}, {
        nowMoment: Fixtures.nowMoment,
        eventNoteTypesIndex: Fixtures.studentProfile.eventNoteTypesIndex,
        currentEducator: Fixtures.currentEducator,
        onSave: jasmine.createSpy('onSave'),
        onCancel: jasmine.createSpy('onCancel'),
        requestState: null
      });
      return ReactDOM.render(createEl(TakeNotes, mergedProps), el);
    }
  };

  SpecSugar.withTestEl('high-level integration tests', function() {
    it('renders note-taking area', function() {
      var el = this.testEl;
      helpers.renderInto(el);

      expect(el).toContainText('February 11, 2016');
      expect(el).toContainText('demo@example.com');
      expect($(el).find('textarea').length).toEqual(1);
      expect($(el).find('.btn.note-type').length).toEqual(4);
      expect($(el).find('.btn.save').length).toEqual(1);
      expect($(el).find('.btn.cancel').length).toEqual(1);
    });
  });
});