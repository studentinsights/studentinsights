import MixpanelUtils from '../helpers/mixpanel_utils.jsx';
import NotesFeedPage from './NotesFeedPage.js';

export default function renderNotesFeedMain(el, options = {}) {
  if (options.json) {
    const {schoolSlug} = $('#serialized-data').data();
    fetch(`/schools/${schoolSlug}/overview_json`, { credentials: 'include' })
      .then(r => r.json())
      .then(json => render(el, json));
  } else {
    const serializedData = $('#serialized-data').data();
    const {students, school} = serializedData; // undo outer camelcase
    render(el, {
      students,
      school,
      current_educator: serializedData.currentEducator,
      constant_indexes: serializedData.constantIndexes
    });
  }
}

function render(el, json) {
  // MixpanelUtils.registerUser(json.current_educator);
  // MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_OVERVIEW_DASHBOARD' });
  window.ReactDOM.render(<SchoolOverviewPage
    notes={json.notes} />, el);
}
