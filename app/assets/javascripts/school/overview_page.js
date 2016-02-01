$(function() {

  if ($('body').hasClass('schools') && $('body').hasClass('show')) {
    var MixpanelUtils = window.shared.MixpanelUtils;
    var Filters = window.shared.Filters;
    var createEl = window.shared.ReactHelpers.createEl;

    function main() {
      var serializedData = $('#serialized-data').data();
      MixpanelUtils.registerUser(serializedData.currentEducator);
      MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_OVERVIEW_DASHBOARD' });

      // index by intervention type id
      var InterventionTypes = serializedData.interventionTypes.reduce(function(map, interventionType) {
        map[interventionType.id] = interventionType;
        return map;
      }, {});

      ReactDOM.render(createEl(SchoolOverviewPage, {
        allStudents: serializedData.students,
        InterventionTypes: InterventionTypes,
        initialFilters: Filters.parseFiltersHash(window.location.hash)
      }), document.getElementById('main'));
    }

    main();
  }
});
