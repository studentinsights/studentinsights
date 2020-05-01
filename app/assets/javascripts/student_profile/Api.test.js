import Api from './Api';
import fetchMock from 'fetch-mock/es5/client';
import mockCsrfForTest from '../testing/mockCsrfForTest';
import fetchMockCalls from '../testing/fetchMockCalls';


function createTestApi() {
  const api = new Api();
  const createNoteSpy = jest.spyOn(api, '_createNote');
  const updateNoteSpy = jest.spyOn(api, '_updateNote');
  return {api, createNoteSpy, updateNoteSpy};
}

beforeEach(() => {
  fetchMock.reset();
  fetchMock.restore();
});

describe('#saveNotes', () => {
  describe('no eventNoteParams id', () => {
    it('calls _createNote', () => {
      fetchMock.post('express:/api/event_notes', {});
      mockCsrfForTest('mocked-csrf-token');

      const {api, createNoteSpy, updateNoteSpy} = createTestApi();
      api.saveNotes(11, {
        draftKey: 'foo-draft-key',
        eventNoteTypeId: 300,
        text: 'Student loves writing specs for JS code, just cannot get enough.',
        isRestricted: true,
        eventNoteAttachments: []
      });

      expect(createNoteSpy).toHaveBeenCalled();
      expect(updateNoteSpy).not.toHaveBeenCalled();
      expect(fetchMockCalls()).toEqual([[
        '/api/event_notes',
        {
          "body": JSON.stringify({
            draft_key: 'foo-draft-key',
            event_note: {
              student_id: 11,
              event_note_type_id: 300,
              is_restricted: true,
              text: 'Student loves writing specs for JS code, just cannot get enough.',
              event_note_attachments_attributes: []
            }
          }),
          "credentials": "same-origin",
          "headers": {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-CSRF-Token": 'mocked-csrf-token'
          },
          "method": "POST"
        }
      ]]);
    });
  });

  describe('with eventNoteParams id', () => {
    it('calls _updateNote', () => {
      fetchMock.patch('express:/api/event_notes/:id', {});
      mockCsrfForTest('mocked-csrf-token');

      const {api, createNoteSpy, updateNoteSpy} = createTestApi();
      api.saveNotes(11, {
        id: 77,
        text: 'updated text!!'
      });

      expect(createNoteSpy).not.toHaveBeenCalled();
      expect(updateNoteSpy).toHaveBeenCalled();
      expect(fetchMockCalls()).toEqual([[
        '/api/event_notes/77',
        {
          "body": JSON.stringify({
            event_note: {
              text: 'updated text!!',
            }
          }),
          "credentials": "same-origin",
          "headers": {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-CSRF-Token": 'mocked-csrf-token'
          },
          "method": "PATCH"
        }
      ]]);
    });
  });
});

it('#deleteEventNoteAttachment', done => {
  fetchMock.delete('express:/api/event_notes/attachments/:id', {});
  mockCsrfForTest('mocked-csrf-token');

  const {api} = createTestApi();
  api.deleteEventNoteAttachment(42).then(json => {
    expect(fetchMockCalls()).toEqual([[
      '/api/event_notes/attachments/42',
      {
        "body": "{\"_method\":\"delete\",\"authenticity_token\":\"mocked-csrf-token\"}",
        "credentials": "same-origin",
        "headers": {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-CSRF-Token": 'mocked-csrf-token'
        },
        "method": "DELETE"
      }
    ]]);
    expect(json).toEqual({});
    done();
  });
});

it('#autosaveDraft', done => {
  fetchMock.put('express:/api/students/:student_id/event_note_drafts/:draft_key', {}, 201);

  const {api} = createTestApi();
  api.autosaveDraft(42, {
    draftKey: 'draft-key-foo',
    eventNoteTypeId: null,
    text: 'Starting to type...',
    isRestricted: true
  }).then(json => {
    expect(fetchMockCalls()).toEqual([[
      '/api/students/42/event_note_drafts/draft-key-foo',
      {
        "body": JSON.stringify({
          draft:{
            text: "Starting to type...",
            event_note_type_id:null,
            is_restricted:true
          }
        }),
        "credentials": "same-origin",
        "headers": {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-CSRF-Token": 'mocked-csrf-token'
        },
        "method": "PUT"
      }
    ]]);
    expect(json).toEqual({});
    done();
  });
});