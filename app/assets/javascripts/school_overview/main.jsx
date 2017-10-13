//= require ./school_overview_page
import MixpanelUtils from '../helpers/mixpanel_utils.jsx';

$(function() {
  if ($('body').hasClass('schools') && $('body').hasClass('show')) {
    const SchoolOverviewPage = window.shared.SchoolOverviewPage;
    const Filters = window.shared.Filters;

    const serializedData = $('#serialized-data').data();
    MixpanelUtils.registerUser(serializedData.currentEducator);
    MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_OVERVIEW_DASHBOARD' });

    window.ReactDOM.render(<SchoolOverviewPage
      allStudents={serializedData.students}
      school={serializedData.school}
      serviceTypesIndex={serializedData.constantIndexes.service_types_index}
      eventNoteTypesIndex={serializedData.constantIndexes.event_note_types_index}
      initialFilters={Filters.parseFiltersHash(window.location.hash)} />, document.getElementById('main'));
  }
});
