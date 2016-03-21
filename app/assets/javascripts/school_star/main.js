//= require ./star_reading_page

$(function() {

  if ($('body').hasClass('schools') && $('body').hasClass('star_reading')) {
    var MixpanelUtils = window.shared.MixpanelUtils;
    var StarReadingPage = window.shared.StarReadingPage;
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
        serviceTypesIndex: serializedData.constantIndexes.service_types_index,
        eventNoteTypesIndex: serializedData.constantIndexes.event_note_types_index,
        initialFilters: Filters.parseFiltersHash(window.location.hash)
      }), document.getElementById('main'));
    }

    main();
  }
});
