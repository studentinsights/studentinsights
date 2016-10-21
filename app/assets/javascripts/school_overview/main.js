//= require ./school_overview_page

$(function() {
  if ($('body').hasClass('schools') && $('body').hasClass('show')) {
    var MixpanelUtils = window.shared.MixpanelUtils;
    var SchoolOverviewPage = window.shared.SchoolOverviewPage;
    var Filters = window.shared.Filters;
    var createEl = window.shared.ReactHelpers.createEl;

    function main() {
      var schoolId = $('#school-id').data('id');

      $.ajax({
        url: window.location.href + '/serialized_data',
        method: 'GET',
        contentType: 'application/json; charset=UTF-8',
        dataType: 'json',
        data: { id: schoolId },
        success: function (serializedData) {
          MixpanelUtils.registerUser(serializedData.currentEducator);
          MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_OVERVIEW_DASHBOARD' });

          ReactDOM.render(createEl(SchoolOverviewPage, {
            allStudents: serializedData.students,
            serviceTypesIndex: serializedData.constant_indexes.service_types_index,
            eventNoteTypesIndex: serializedData.constant_indexes.event_note_types_index,
            initialFilters: Filters.parseFiltersHash(window.location.hash)
          }), document.getElementById('main'));
        }
      });
    }

    main();
  }
});
