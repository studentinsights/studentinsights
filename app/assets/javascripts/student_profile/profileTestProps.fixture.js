import {initialState} from './PageContainer';
import {nowMoment} from './fixtures/fixtures';
import serializedDataForOlafWhite from './fixtures/serializedDataForOlafWhite.fixture';
import serializedDataForPlutoPoppins from './fixtures/serializedDataForPlutoPoppins.fixture';
import serializedDataForAladdinMouse from './fixtures/serializedDataForAladdinMouse.fixture';


export function testPropsForOlafWhite() {
  return testPropsFromSerializedData(serializedDataForOlafWhite);
}

export function testPropsForPlutoPoppins() {
  return testPropsFromSerializedData(serializedDataForPlutoPoppins);
}

export function testPropsForAladdinMouse() {
  return testPropsFromSerializedData(serializedDataForAladdinMouse);
}

export function testPropsFromSerializedData(serializedData, queryParams = {}) {
  return {
    ...initialState({serializedData, queryParams}),
    nowMomentFn() { return nowMoment; },
    actions: {
      onColumnClicked: jest.fn(),
      onClickSaveNotes: jest.fn(),
      onClickSaveTransitionNote: jest.fn(),
      onDeleteEventNoteAttachment: jest.fn(),
      onClickSaveService: jest.fn(),
      onClickDiscontinueService: jest.fn(),
      onChangeNoteInProgressText: jest.fn(),
      onClickNoteType: jest.fn(),
      onChangeAttachmentUrl: jest.fn()
    },
    districtKey: 'somerville'
  };
}
