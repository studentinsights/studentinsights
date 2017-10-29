import MixpanelUtils from '../helpers/mixpanel_utils.jsx';

export default function renderSchoolOverviewMain(el) {
  const SchoolOverviewPage = window.shared.SchoolOverviewPage;
  const Filters = window.shared.Filters;

  const {schoolSlug} = $('#serialized-data').data();
  fetch(`/schools/${schoolSlug}/overview.json`, { credentials: 'include' })
    .then(r => r.json())
    .then(serializedData => {
      MixpanelUtils.registerUser(serializedData.currentEducator);
      MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_OVERVIEW_DASHBOARD' });
      window.ReactDOM.render(<SchoolOverviewPage
        allStudents={serializedData.students}
        school={serializedData.school}
        serviceTypesIndex={serializedData.constant_indexes.service_types_index}
        eventNoteTypesIndex={serializedData.constant_indexes.event_note_types_index}
        initialFilters={Filters.parseFiltersHash(window.location.hash)} />, el);
    });
}