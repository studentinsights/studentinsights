import MixpanelUtils from '../helpers/mixpanel_utils.jsx';
import NotesFeedPage from './NotesFeedPage.js';

export default function renderNotesFeedMain(el, options = {}) {
  console.log("🤓🤓🤓🤓🤓🤓🤓");
  const {schoolSlug} = $('#serialized-data').data();
  fetch(`/educators/notes_feed`, { credentials: 'include' })
    .then(r => r.json())
    .then(json => render(el, json));
  console.log('json');
  console.log(json);
}
  
function render(el, json) {
  // MixpanelUtils.registerUser(json.current_educator);
  // MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_OVERVIEW_DASHBOARD' });
  console.log('json');
  console.log(json);
  window.ReactDOM.render(<NotesFeedPage
    eventNotes={json.event_notes} />, el);
}
