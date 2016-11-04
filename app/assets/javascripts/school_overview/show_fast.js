//= require ./school_overview_page

$(function() {
  if ($('body').hasClass('schools') && $('body').hasClass('show_fast')) {
    var MixpanelUtils = window.shared.MixpanelUtils;
    var SchoolOverviewPage = window.shared.SchoolOverviewPage;
    var Filters = window.shared.Filters;
    var createEl = window.shared.ReactHelpers.createEl;

    function main() {
      var schoolId = $('#serialized-data').data().schoolId;
      $.ajax({
         url: '/schools/' + schoolId + '/json_endpoint',
         method: 'GET',
         contentType: 'application/json; charset=UTF-8',
         dataType: 'json'
      }).done(render);
    }

    function render(serializedData) {
      MixpanelUtils.registerUser(serializedData.currentEducator);
      MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_OVERVIEW_DASHBOARD_FAST' });

      ReactDOM.render(createEl(SchoolOverviewPage, {
        allStudents: serializedData.students,
        serviceTypesIndex: serializedData.constant_indexes.service_types_index,
        eventNoteTypesIndex: serializedData.constant_indexes.event_note_types_index,
        initialFilters: Filters.parseFiltersHash(window.location.hash)
      }), document.getElementById('main'));
    }

    main();
  }
});
