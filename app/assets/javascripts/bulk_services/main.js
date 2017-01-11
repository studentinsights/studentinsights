$(function() {
  // only run if the correct page
  if (!($('body').hasClass('educators') &&
        $('body').hasClass('bulk_services_upload'))) return;

  var createEl = window.shared.ReactHelpers.createEl;
  var BulkServicesPage = window.shared.BulkServicesPage;
  var MixpanelUtils = window.shared.MixpanelUtils;

  var serializedData = $('#serialized-data').data();
  MixpanelUtils.registerUser(serializedData.currentEducator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'BULK_SERVICES_PAGE' });

  ReactDOM.render(createEl(BulkServicesPage, {
    serializedData: serializedData,
  }), document.getElementById('main'));
});
