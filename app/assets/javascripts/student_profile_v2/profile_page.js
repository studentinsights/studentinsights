$(function() {
  // only run if the correct page
  if (!($('body').hasClass('students') && $('body').hasClass('profile'))) return;

  // imports
  var createEl = window.shared.ReactHelpers.createEl;
  var StudentProfileV2Page = window.shared.StudentProfileV2Page;

  // entry point
  function main() {
    var serializedData = $('#serialized-data').data();
    window.serializedData = serializedData;

    // TODO(kr) hacking around with local data for now
    var now = new Date();
    // var dateRange = [now, moment(now).subtract(1, 'year').toDate()];
    var dateRange = [new Date(2010, 11, 19), new Date(2011, 11, 19)]

    ReactDOM.render(createEl(StudentProfileV2Page, {
      student: serializedData.student,
      chartData: serializedData.chartData,
      attendanceData: serializedData.attendanceData,
      dateRange: dateRange
    }), document.getElementById('main'));
  }

  main();
});
