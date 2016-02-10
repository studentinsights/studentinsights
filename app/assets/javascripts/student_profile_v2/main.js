$(function() {
  // only run if the correct page
  if (!($('body').hasClass('students') && $('body').hasClass('profile'))) return;

  // imports
  var createEl = window.shared.ReactHelpers.createEl;
  var StudentProfileV2Page = window.shared.StudentProfileV2Page;
  var parseQueryString = window.shared.parseQueryString;

  // entry point
  function main() {
    var now = new Date();
    var serializedData = $('#serialized-data').data();
    var dateRange = [moment(now).subtract(1, 'year').toDate(), now];
    ReactDOM.render(createEl(StudentProfileV2Page, {
      now: now,
      dateRange: dateRange,
      queryParams: parseQueryString(window.location.search),
      student: serializedData.student,
      feed: serializedData.feed,
      chartData: serializedData.chartData,
      interventionTypesIndex: serializedData.interventionTypesIndex,
      educatorsIndex: serializedData.educatorsIndex,
      attendanceData: serializedData.attendanceData,
    }), document.getElementById('main'));
  }

  main();
});
