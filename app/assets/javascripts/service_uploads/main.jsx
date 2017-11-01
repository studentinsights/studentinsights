import MixpanelUtils from '../helpers/mixpanel_utils.jsx';

export default function renderServiceUploadsMain(el) {
  const ReactDOM = window.ReactDOM;
  const ServiceUploadsPage = window.shared.ServiceUploadsPage;

  const serializedData = $('#serialized-data').data();
  MixpanelUtils.registerUser(serializedData.currentEducator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'SERVICE_UPLOADS_PAGE' });

  ReactDOM.render(<ServiceUploadsPage serializedData={serializedData} />, el);
}
