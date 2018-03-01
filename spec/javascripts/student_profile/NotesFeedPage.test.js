import NotesFeedPage from '../../../app/assets/javascripts/notes_feed/NotesFeedPage.js';
import SpecSugar from '../support/spec_sugar.jsx';

SpecSugar.withTestEl('high-level integration tests', function(container) {
  describe('NotesFeedPage', () => {
    it('displays notes with student cards without crashing', () => {
      const el = container.testEl;
      window.ReactDOM.render(<NotesFeedPage
        educatorsIndex={{}}
        eventNotes={[]}
        eventNoteTypesIndex={{}}
        onClickLoadMoreNotes={jest.fn()}
        totalNotesCount={0} />, el);
    });
  });
});
