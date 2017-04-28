import {studentProfile} from './fixtures.jsx';
import SpecSugar from '../support/spec_sugar.jsx';


describe('RestrictedNotesPageContainer', function() {
  const merge = window.shared.ReactHelpers.merge;
  const ReactDOM = window.ReactDOM;
  const RestrictedNotesPageContainer = window.shared.RestrictedNotesPageContainer;

  const helpers = {
    renderInto: function(el, props) {
      const mergedProps = merge(props || {}, {
        nowMomentFn: moment.utc,
        serializedData: studentProfile
      });
      ReactDOM.render(<RestrictedNotesPageContainer {...mergedProps} />, el);
    },

    createMockApi: function(){
      const mockApi = jasmine.createSpyObj('api', ['saveNotes']);
      mockApi.saveNotes.and.returnValue(
        $.Deferred().resolve({
          id: 9999,
          text: 'hi',
          is_restricted: true,
          event_note_type_id: 301,
          student_id: 23,
          educator_id: 1,
          attachments: [],
          event_note_revisions: []
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
      const el = this.testEl;
      const mockApi = helpers.createMockApi();
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
