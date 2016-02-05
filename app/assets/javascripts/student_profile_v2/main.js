$(function() {
  // only run if the correct page
  if (!($('body').hasClass('students') && $('body').hasClass('profile'))) return;

  // imports
  var createEl = window.shared.ReactHelpers.createEl;
  var StudentProfileV2Page = window.shared.StudentProfileV2Page;
  var parseQueryString = window.shared.parseQueryString;

  // entry point
  function main() {
    var serializedData = $('#serialized-data').data();
    window.serializedData = serializedData;

    // TODO(kr) hacking around with local data for now
    var now = new Date();
    var dateRange = [moment(now).subtract(1, 'year').toDate(), now];
    // var dateRange = [new Date(2010, 11, 19), new Date(2011, 11, 19)]

    ReactDOM.render(createEl(StudentProfileV2Page, {
      queryParams: parseQueryString(window.location.search),
      student: serializedData.student,
      notes: serializedData.notes,
      chartData: serializedData.chartData,
      interventionTypesIndex: serializedData.interventionTypesIndex,
      attendanceData: serializedData.attendanceData,
      now: now,
      dateRange: dateRange
    }), document.getElementById('main'));
  }

  main();
});
