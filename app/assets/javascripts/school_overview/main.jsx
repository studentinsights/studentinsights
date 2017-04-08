//= require ./school_overview_page

$(function() {
  if ($('body').hasClass('schools') && $('body').hasClass('show')) {
    const MixpanelUtils = window.shared.MixpanelUtils;
    const SchoolOverviewPage = window.shared.SchoolOverviewPage;
    const Filters = window.shared.Filters;

    // Analytics 
    const serializedData = $('#serialized-data').data();
    MixpanelUtils.registerUser(serializedData.currentEducator);
    MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_OVERVIEW_DASHBOARD' });

    // Render
    ReactDOM.render(<SchoolOverviewPage
      allStudents={serializedData.students}
      serviceTypesIndex={serializedData.constantIndexes.service_types_index}
      eventNoteTypesIndex={serializedData.constantIndexes.event_note_types_index}
      initialFilters={Filters.parseFiltersHash(window.location.hash)} />, document.getElementById('main'));
  }
});
