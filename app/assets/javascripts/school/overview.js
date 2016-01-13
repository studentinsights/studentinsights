$(function() {

  if ($('body').hasClass('schools') && $('body').hasClass('show')) {

    var dom = ReactHelpers.dom;
    var createEl = ReactHelpers.createEl;
    var merge = ReactHelpers.merge;


    function main() {
      var serializedData = $('#serialized-data').data();
      window.serializedData = serializedData;

      // index by intervention type id
      var InterventionTypes = serializedData.interventionTypes.reduce(function(map, interventionType) {
        map[interventionType.id] = interventionType;
        return map;
      }, {});

      ReactDOM.render(createEl(SchoolOverviewPage, {
        allStudents: serializedData.students,
        InterventionTypes: InterventionTypes,
        initialFilters: parseFiltersHash(window.location.hash)
      }), document.getElementById('main'));
    }

    // Returns a list of Filters
    function parseFiltersHash(hash) {
      var pieces = _.compact(hash.slice(1).split('&'));
      return _.compact(pieces.map(function(piece) {
        return Filters.createFromIdentifier(window.decodeURIComponent(piece));
      }));
    };

    main();
  }
});
