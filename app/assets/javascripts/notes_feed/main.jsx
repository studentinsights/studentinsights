import MixpanelUtils from '../helpers/mixpanel_utils.jsx';
import NotesFeedPage from './NotesFeedPage.js';

export default function renderNotesFeedMain(el, options = {}) {
  if (options.json) {
    fetch(`/educators/notes_feed`, { credentials: 'include' })
    .then(response => response.json())
    .then(json => render(el, json));
  } else {
    const serializedData = $('#serialized-data').data();
    const {students, notes} = serializedData; // undo outer camelcase
    render(el, {
      students,
      notes,
      current_educator: serializedData.currentEducator,
    });
  };
}
  
function render(el, json) {
  // MixpanelUtils.registerUser(json.current_educator);
  // MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_OVERVIEW_DASHBOARD' });
  console.log(json);
  window.ReactDOM.render(<NotesFeedPage
    students={json.students}
    notes={json.notes} />, el);
}
