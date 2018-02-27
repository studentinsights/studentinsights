import MixpanelUtils from '../helpers/mixpanel_utils.jsx';
import ServiceTypesControlPanel from './ServiceTypesControlPanel.js';

export default function renderServiceTypesControlPanel(el) {
  const ReactDOM = window.ReactDOM;
  const ServiceUploadsPage = window.shared.ServiceUploadsPage;

  const serializedData = $('#serialized-data').data();
  MixpanelUtils.registerUser(serializedData.currentEducator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'SERVICE_TYPES_CONTROL_PANEL' });

  ReactDOM.render(<ServiceTypesControlPanel serializedData={serializedData} />, el);
}
