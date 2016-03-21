//= require ./school_overview_page

$(function() {
  if ($('body').hasClass('schools') && $('body').hasClass('show')) {
    var MixpanelUtils = window.shared.MixpanelUtils;
    var SchoolOverviewPage = window.shared.SchoolOverviewPage;
    var Filters = window.shared.Filters;
    var createEl = window.shared.ReactHelpers.createEl;

    function main() {
      var serializedData = $('#serialized-data').data();
      MixpanelUtils.registerUser(serializedData.currentEducator);
      MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_OVERVIEW_DASHBOARD' });

      ReactDOM.render(createEl(SchoolOverviewPage, {
        allStudents: serializedData.students,
        serviceTypesIndex: serializedData.constantIndexes.service_types_index,
        eventNoteTypesIndex: serializedData.constantIndexes.event_note_types_index,
        initialFilters: Filters.parseFiltersHash(window.location.hash)
      }), document.getElementById('main'));
    }

    main();
  }
});
