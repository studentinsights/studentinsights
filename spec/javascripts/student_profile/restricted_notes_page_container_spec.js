//= require ./fixtures

describe('RestrictedNotesPageContainer', function() {
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var SpecSugar = window.shared.SpecSugar;
  var Fixtures = window.shared.Fixtures;
  var RestrictedNotesPageContainer = window.shared.RestrictedNotesPageContainer;

  var helpers = {
    renderInto: function(el, props) {
      var mergedProps = merge(props || {}, {
        nowMomentFn: moment.utc,
        serializedData: Fixtures.studentProfile,
      });
      return ReactDOM.render(createEl(RestrictedNotesPageContainer, mergedProps), el);
    },

    createMockApi: function(){
      var mockApi = jasmine.createSpyObj('api', ['saveNotes']);
      mockApi.saveNotes.and.returnValue(
        $.Deferred().resolve({
          id: 9999,
          text: 'hi',
          is_restricted: true,
          event_note_type_id: 301,
          student_id: 23,
          educator_id: 1,
          attachments: []
        })
      );
      return mockApi;
    },

    takeNotesAndSave: function(el, uiParams) {
      $(el).find('.btn.take-notes').click();
      SpecSugar.changeTextValue($(el).find('textarea'), uiParams.text);
      $(el).find('.btn.note-type:contains(' + uiParams.eventNoteTypeText + ')').click();
      $(el).find('.btn.save').click();
    },
  };

  SpecSugar.withTestEl('high-level integration tests', function() {
    it('saves notes as restricted', function() {
      var el = this.testEl;
      var mockApi = helpers.createMockApi();
      helpers.renderInto(el, {api: mockApi});

      helpers.takeNotesAndSave(el, {
        text: "hi",
        eventNoteTypeText: "MTSS Meeting"
      });

      // 23 is the student id, and MTSS Meeting has id 301.
      expect(mockApi.saveNotes).toHaveBeenCalledWith(23, {
        eventNoteTypeId: 301,
        text: 'hi',
        is_restricted: true,
        eventNoteAttachments: []
      });
    });
  });
});
