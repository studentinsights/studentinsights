import MixpanelUtils from '../helpers/mixpanel_utils.jsx';
import NotesFeedPage from './NotesFeedPage.js';

export default function renderNotesFeedMain(el, options = {}) {
  if (options.json) {
    fetch(`/educators/notes_feed`, { credentials: 'include' })
    .then(response => response.json())
    .then(json => render(el, json));
  } else {
    const serializedData = $('#serialized-data').data();
    render(el, {
      current_educator: serializedData.currentEducator,
      educatorsIndex: serializedData.educatorsIndex,
      eventNoteTypesIndex: serializedData.eventNoteTypesIndex,
      notes: serializedData.notes,
      students: serializedData.students,
    });
  }
}
  
function render(el, json) {
  MixpanelUtils.registerUser(json.current_educator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'NOTES_FEED' });
  window.ReactDOM.render(<NotesFeedPage
    educatorsIndex={json.educatorsIndex}
    eventNotes={json.notes}
    eventNoteTypesIndex={json.eventNoteTypesIndex}
    students={json.students} />, el);
}
