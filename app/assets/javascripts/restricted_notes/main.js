$(function() {
  // only run if the correct page
  if (!($('body').hasClass('students') && $('body').hasClass('restricted_notes'))) return;

  // imports
  var createEl = window.shared.ReactHelpers.createEl;
  var RestrictedNotesPageContainer = window.shared.RestrictedNotesPageContainer;

  // entry point, reading static bootstrapped data from the page
  // var serializedData = $('#serialized-data').data();
  ReactDOM.render(createEl(RestrictedNotesPageContainer, {
    serializedData: $('#serialized-data').data(),
    nowMomentFn: moment.utc
  }), document.getElementById('main'));
});
