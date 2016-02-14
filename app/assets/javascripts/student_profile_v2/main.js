$(function() {
  // only run if the correct page
  if (!($('body').hasClass('students') && $('body').hasClass('profile'))) return;

  // imports
  var createEl = window.shared.ReactHelpers.createEl;
  var PageContainer = window.shared.PageContainer;
  var parseQueryString = window.shared.parseQueryString;

  // entry point, reading static bootstrapped data from the page
  ReactDOM.render(createEl(PageContainer, {
    nowMomentFn: function() { return moment(); },
    serializedData: $('#serialized-data').data(),
    queryParams: parseQueryString(window.location.search)
  }), document.getElementById('main'));
});
