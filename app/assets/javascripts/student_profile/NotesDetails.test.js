import React from 'react';
import ReactDOM from 'react-dom';
import {SOMERVILLE} from '../helpers/PerDistrict';
import {withDefaultNowContext} from '../testing/NowContainer';
import NotesDetails from './NotesDetails';
import PerDistrictContainer from '../components/PerDistrictContainer';


function testRenderWithEl(districtKey, props) {
  const mergedProps = {
    currentEducator: null, // caller should set
    educatorsIndex: {},
    noteInProgressText: '',
    noteInProgressType: null,
    noteInProgressAttachmentUrls: [],
    actions: {
      onClickSaveNotes: jest.fn(),
      onEventNoteAttachmentDeleted: jest.fn(),
      onChangeNoteInProgressText: jest.fn(),
      onClickNoteType: jest.fn(),
      onChangeAttachmentUrl: jest.fn()
    },
    feed: {
      event_notes: [],
      services: {
        active: [], discontinued: []
      },
      deprecated: {
        interventions: []
      }
    },
    requests: {},
    showRestrictedNotesButton: false,
    allowDirectEditingOfRestrictedNoteText: false,
    title: '',
    helpContent: '',
    helpTitle: '',
    ...props
  };

  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(
    <PerDistrictContainer districtKey={districtKey}>
      <NotesDetails {...mergedProps} />
    </PerDistrictContainer>
  ), el);
  return {el};
}

describe('educator can view restricted notes', () => {
  it('renders restricted notes button with zero notes', () => {
    const {el} = testRenderWithEl(SOMERVILLE, {
      showRestrictedNotesButton: true,
      currentEducator: { id: 42, can_view_restricted_notes: true },
      student: { restricted_notes_count: 0 },
    });
    expect(el.innerHTML).toContain('Restricted (0)');
  });

  it('renders restricted notes button with 7 notes', () => {
    const {el} = testRenderWithEl(SOMERVILLE, {
      showRestrictedNotesButton: true,
      currentEducator: { id: 42, can_view_restricted_notes: true },
      student: { restricted_notes_count: 7 },
    });
    expect(el.innerHTML).toContain('Restricted (7)');
  });
});

describe('educator can not view restricted notes', () => {
  it('does not render restricted notes button', () => {
    const {el} = testRenderWithEl(SOMERVILLE, {
      showRestrictedNotesButton: true,
      currentEducator: { id: 42, can_view_restricted_notes: false },
      student: { restricted_notes_count: 0 },
    });
    expect(el.innerHTML).not.toContain('Restricted (0)');
  });
});

it('defaults to showRestrictedNotesButton:false', () => {
  const {el} = testRenderWithEl(SOMERVILLE, {
    currentEducator: { id: 42, can_view_restricted_notes: true },
    student: { restricted_notes_count: 0 },
  });
  expect(el.innerHTML).not.toContain('Restricted (0)');
});