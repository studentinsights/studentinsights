$(function() {
  // only run if the correct page
  if (!($('body').hasClass('students') && $('body').hasClass('restricted_notes'))) return;

  // imports
  const createEl = window.shared.ReactHelpers.createEl;
  const RestrictedNotesPageContainer = window.shared.RestrictedNotesPageContainer;

  // entry point, reading static bootstrapped data from the page
  // var serializedData = $('#serialized-data').data();
  ReactDOM.render(<RestrictedNotesPageContainer serializedData={$('#serialized-data').data()} nowMomentFn={moment.utc} />, document.getElementById('main'));
});
