import Api from './Api';

function createTestApi() {
  const api = new Api();
  const createNoteSpy = jest.spyOn(api, '_createNote');
  const updateNoteSpy = jest.spyOn(api, '_updateNote');
  return {api, createNoteSpy, updateNoteSpy};
}

describe('#saveNotes', () => {
  describe('no eventNoteParams id', () => {
    it('calls _createNote', () => {
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