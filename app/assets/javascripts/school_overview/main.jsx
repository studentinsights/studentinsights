import MixpanelUtils from '../helpers/mixpanel_utils.jsx';

// Load data from inline on the page or with another request
export default function renderSchoolOverviewMain(el, options = {}) {
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
  const SchoolOverviewPage = window.shared.SchoolOverviewPage;
  const Filters = window.shared.Filters;

  MixpanelUtils.registerUser(json.current_educator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_OVERVIEW_DASHBOARD' });
  window.ReactDOM.render(<SchoolOverviewPage
    allStudents={json.students}
    school={json.school}
    serviceTypesIndex={json.constant_indexes.service_types_index}
    eventNoteTypesIndex={json.constant_indexes.event_note_types_index}
    initialFilters={Filters.parseFiltersHash(window.location.hash)} />, el);
}