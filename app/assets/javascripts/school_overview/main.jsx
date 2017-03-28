//= require ./school_overview_page

$(function() {
  if ($('body').hasClass('schools') && $('body').hasClass('show')) {
    const MixpanelUtils = window.shared.MixpanelUtils;
    const SchoolOverviewPage = window.shared.SchoolOverviewPage;
    const Filters = window.shared.Filters;
    const createEl = window.shared.ReactHelpers.createEl;

    function main() {
      const serializedData = $('#serialized-data').data();
      MixpanelUtils.registerUser(serializedData.currentEducator);
      MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_OVERVIEW_DASHBOARD' });

      ReactDOM.render(<SchoolOverviewPage
        allStudents={serializedData.students}
        serviceTypesIndex={serializedData.constantIndexes.service_types_index}
        eventNoteTypesIndex={serializedData.constantIndexes.event_note_types_index}
        initialFilters={Filters.parseFiltersHash(window.location.hash)} />, document.getElementById('main'));
    }

    main();
  }
});
