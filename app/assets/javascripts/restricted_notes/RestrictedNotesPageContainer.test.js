import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import {SOMERVILLE} from '../helpers/PerDistrict';
import {TEST_TIME_STRING, testTimeMoment, withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import {studentProfile} from '../student_profile/fixtures/fixtures';
import RestrictedNotesPageContainer from './RestrictedNotesPageContainer';
import changeTextValue from '../testing/changeTextValue';


const helpers = {
  renderInto(districtKey, props) {
    const mergedProps = {
      nowMomentFn: testTimeMoment,
      serializedData: studentProfile,
      ...props
    };
    const el = document.createElement('div');
    ReactDOM.render(withDefaultNowContext(
      <PerDistrictContainer districtKey={districtKey}>
        <RestrictedNotesPageContainer {...mergedProps} />
      </PerDistrictContainer>
    ), el);
    return {el};
  },

  createMockApi() {
    const mockApi = {
      saveNotes: jest.fn()
    };
    mockApi.saveNotes.mockImplementation(() =>
      $.Deferred().resolve({
        id: 9999,
        text: 'RESTRICTED-something-sensitive-original',
        is_restricted: true,
        event_note_type_id: 301,
        student_id: 23,
        educator_id: 1,
        attachments: [],
        event_note_revisions_count: 0,
        recorded_at: TEST_TIME_STRING,
        created_at: TEST_TIME_STRING,
        updated_at: TEST_TIME_STRING
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
      text: 'RESTRICTED-something-sensitive-changed',
      eventNoteTypeText: "MTSS Meeting"
    });

    // 23 is the student id, and MTSS Meeting has id 301.
    expect(mockApi.saveNotes).toHaveBeenCalledWith(23, {
      eventNoteTypeId: 301,
      text: 'RESTRICTED-something-sensitive-changed',
      isRestricted: true,
      eventNoteAttachments: []
    });
  });
});
