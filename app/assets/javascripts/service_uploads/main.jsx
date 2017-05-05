const ReactDOM = window.ReactDOM;

$(function() {
  // only run if the correct page
  if (!($('body').hasClass('service_uploads') && $('body').hasClass('index'))) return;

  const ServiceUploadsPage = window.shared.ServiceUploadsPage;
  const MixpanelUtils = window.shared.MixpanelUtils;

  const serializedData = $('#serialized-data').data();
  MixpanelUtils.registerUser(serializedData.currentEducator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'SERVICE_UPLOADS_PAGE' });

  ReactDOM.render(<ServiceUploadsPage serializedData={serializedData} />, document.getElementById('main'));
});
