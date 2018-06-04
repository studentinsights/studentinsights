import ReactDOM from 'react-dom';
import SpecSugar from '../../../../spec/javascripts/support/spec_sugar.jsx';
import NotesFeedPage from './NotesFeedPage';

SpecSugar.withTestEl('high-level integration tests', function(container) {
  describe('NotesFeedPage', () => {
    it('displays notes with student cards without crashing', () => {
      const el = container.testEl;
      ReactDOM.render(<NotesFeedPage
        educatorsIndex={{}}
        eventNotes={[]}
        eventNoteTypesIndex={{}}
        onClickLoadMoreNotes={jest.fn()}
        totalNotesCount={0} />, el);
    });
  });
});
