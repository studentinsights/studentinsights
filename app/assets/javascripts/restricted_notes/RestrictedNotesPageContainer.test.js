import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import moment from 'moment';
import {SOMERVILLE} from '../helpers/PerDistrict';
import PerDistrictContainer from '../components/PerDistrictContainer';
import {studentProfile} from '../student_profile/fixtures/fixtures';
import RestrictedNotesPageContainer from './RestrictedNotesPageContainer';
import changeTextValue from '../testing/changeTextValue';


const helpers = {
  renderInto(districtKey, props) {
    const mergedProps = {
      nowMomentFn: moment.utc,
      serializedData: studentProfile,
      ...props
    };
    const el = document.createElement('div');
    ReactDOM.render(
      <PerDistrictContainer districtKey={districtKey}>
        <RestrictedNotesPageContainer {...mergedProps} />
      </PerDistrictContainer>
    , el);
    return {el};
  },

  createMockApi() {
    const mockApi = {
      saveNotes: jest.fn()
    };
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

  takeNotesAndSave(el, uiParams) {
    ReactTestUtils.Simulate.click($(el).find('.btn.take-notes').get(0));
    changeTextValue($(el).find('textarea').get(0), uiParams.text);
    ReactTestUtils.Simulate.click($(el).find('.btn.note-type:contains(' + uiParams.eventNoteTypeText + ')').get(0));
    ReactTestUtils.Simulate.click($(el).find('.btn.save').get(0));
  }
};

describe('high-level integration tests', () => {
  it('saves notes as restricted', () => {
    const mockApi = helpers.createMockApi();
    const {el} = helpers.renderInto(SOMERVILLE, {api: mockApi});

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
