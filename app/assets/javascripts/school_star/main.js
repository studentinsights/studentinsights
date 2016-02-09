//= require ./star_reading_page

$(function() {

  if ($('body').hasClass('schools') && $('body').hasClass('star_reading')) {
    var MixpanelUtils = window.shared.MixpanelUtils;
    var StarReadingPage = window.shared.StarReadingPage;
    var SlicePanels = window.shared.SlicePanels;
    var Routes = window.shared.Routes;
    var styles = window.shared.styles;
    var colors = window.shared.colors;
    var dom = window.shared.ReactHelpers.dom;
    var createEl = window.shared.ReactHelpers.createEl;
    var merge = window.shared.ReactHelpers.merge;

    function main() {
      var serializedData = $('#serialized-data').data();
      MixpanelUtils.registerUser(serializedData.currentEducator);
      MixpanelUtils.track('PAGE_VISIT', { page_key: 'STAR_READING_PAGE' });

      ReactDOM.render(createEl(StarReadingPage, {
        students: serializedData.studentsWithStarReading,
        dateNow: new Date(),
        InterventionTypes: serializedData.interventionTypesIndex,
        initialFilters: Filters.parseFiltersHash(window.location.hash)
      }), document.getElementById('main'));
    }

    main();
  }
});
