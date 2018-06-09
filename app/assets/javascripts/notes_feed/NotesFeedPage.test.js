import React from 'react';
import ReactDOM from 'react-dom';
import NotesFeedPage from './NotesFeedPage';


it('displays notes with student cards without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<NotesFeedPage
    educatorsIndex={{}}
    eventNotes={[]}
    eventNoteTypesIndex={{}}
    onClickLoadMoreNotes={jest.fn()}
    totalNotesCount={0} />, el);
});
