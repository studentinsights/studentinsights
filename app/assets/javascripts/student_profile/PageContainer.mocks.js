import {IDLE} from '../helpers/requestStates';

export function createSpyActions() {
  return {
    onColumnClicked: jest.fn(),
    onDraftChanged: jest.fn(),
    onUpdateExistingNote: jest.fn(),
    onCreateNewNote: jest.fn(),
    onDeleteEventNoteAttachment: jest.fn(),
    onSaveService: jest.fn(),
    onDiscontinueService: jest.fn(),
    onSecondTransitionNoteAdded: jest.fn()
  };
}

export function createSpyApi() {
  return {
    autosaveDraft: jest.fn(),
    saveNotes: jest.fn(),
    deleteEventNoteAttachment: jest.fn(),
    saveService: jest.fn(),
    discontinueService: jest.fn()
  };
}

export function createRequestsState() {
  return {
    createNote: IDLE,
    updateNote: {},
    saveService: IDLE,
    discontinueService: {}
  };
}
