$(function() {
  // only run if the correct page
  if (!($('body').hasClass('service_uploads') &&
        $('body').hasClass('index'))) return;

  var createEl = window.shared.ReactHelpers.createEl;
  var ServiceUploadsPage = window.shared.ServiceUploadsPage;
  var MixpanelUtils = window.shared.MixpanelUtils;

  var serializedData = $('#serialized-data').data();
  MixpanelUtils.registerUser(serializedData.currentEducator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'SERVICE_UPLOADS_PAGE' });

  ReactDOM.render(createEl(ServiceUploadsPage, {
    serializedData: serializedData,
  }), document.getElementById('main'));
});
