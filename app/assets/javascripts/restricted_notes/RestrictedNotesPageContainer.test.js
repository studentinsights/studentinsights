import React from 'react';
import ReactDOM from 'react-dom';
import {studentProfile} from '../student_profile/fixtures';
import SpecSugar from '../../../../spec/javascripts/support/spec_sugar.jsx';
import createSpyObj from '../../../../spec/javascripts/support/createSpyObj';
import RestrictedNotesPageContainer from './RestrictedNotesPageContainer';

const helpers = {
  renderInto: function(el, props) {
    const mergedProps = {
      nowMomentFn: moment.utc,
      serializedData: studentProfile,
      ...props
    };
    ReactDOM.render(<RestrictedNotesPageContainer {...mergedProps} />, el);
  },

  createMockApi: function(){
    const mockApi = createSpyObj('api', ['saveNotes']);
    mockApi.saveNotes.mockImplementation(() =>
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

SpecSugar.withTestEl('high-level integration tests', function(container) {
  it('saves notes as restricted', function() {
    const el = container.testEl;
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
