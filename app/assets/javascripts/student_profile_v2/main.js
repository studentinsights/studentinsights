$(function() {
  // only run if the correct page
  if (!($('body').hasClass('students') && $('body').hasClass('profile'))) return;

  // imports
  var createEl = window.shared.ReactHelpers.createEl;
  var StudentProfileV2Page = window.shared.StudentProfileV2Page;
  var parseQueryString = window.shared.parseQueryString;

  // entry point, reading static bootstrapped data from the page
  ReactDOM.render(createEl(StudentProfileV2Page, {
    nowMomentFn: function() { return moment(); },
    serializedData: $('#serialized-data').data(),
    queryParams: parseQueryString(window.location.search)
  }), document.getElementById('main'));
});
