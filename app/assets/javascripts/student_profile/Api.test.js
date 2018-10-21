import Api from './Api';
import fetchMock from 'fetch-mock/es5/client';
import mockCsrfForTest from '../testing/mockCsrfForTest';

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
      const {api, createNoteSpy, updateNoteSpy} = createTestApi();
      api.saveNotes(1, {
        text: 'Student loves writing specs for JS code, just cannot get enough.'
      });

      expect(createNoteSpy).toHaveBeenCalled();
      expect(updateNoteSpy).not.toHaveBeenCalled();
    });
  });

  describe('with eventNoteParams id', () => {
    it('calls _updateNote', () => {
      fetchMock.patch('express:/api/event_notes/:id', {});
      const {api, createNoteSpy, updateNoteSpy} = createTestApi();
      api.saveNotes(1, {
        id: 1,
        text: 'Student loves writing specs for JS code, just cannot get enough.'
      });

      expect(createNoteSpy).not.toHaveBeenCalled();
      expect(updateNoteSpy).toHaveBeenCalled();
    });
  });
});

it('#deleteEventNoteAttachment', done => {
  fetchMock.delete('express:/api/event_notes/attachments/:id', {});
  mockCsrfForTest('mocked-csrf-token');

  const {api} = createTestApi();
  api.deleteEventNoteAttachment(42).then(json => {
    expect(fetchMock.calls()).toEqual([[
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