import Api from './Api';

describe('Api', function() {

  describe('#saveNotes', function() {

    describe('no eventNoteParams id', function() {
      it('calls _createNote', function() {
        const api = new Api();

        spyOn(api, '_createNote');
        spyOn(api, '_updateNote');

        api.saveNotes(1, {
          text: 'Student loves writing specs for JS code, just cannot get enough.'
        });

        expect(api._createNote.calls.any()).toEqual(true);
        expect(api._updateNote.calls.any()).toEqual(false);
      });
    });

    describe('with eventNoteParams id', function() {
      it('calls _updateNote', function() {
        const api = new Api();

        spyOn(api, '_createNote');
        spyOn(api, '_updateNote');

        api.saveNotes(1, {
          id: 1,
          text: 'Student loves writing specs for JS code, just cannot get enough.'
        });

        expect(api._createNote.calls.any()).toEqual(false);
        expect(api._updateNote.calls.any()).toEqual(true);
      });
    });

  });

});
