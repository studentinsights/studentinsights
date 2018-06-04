import ReactDOM from 'react-dom';
import MixpanelUtils from '../helpers/MixpanelUtils';
import ServiceUploadsPage from './ServiceUploadsPage';

export default function renderServiceUploadsMain(el) {
  const serializedData = $('#serialized-data').data();
  MixpanelUtils.registerUser(serializedData.currentEducator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'SERVICE_UPLOADS_PAGE' });

  ReactDOM.render(<ServiceUploadsPage serializedData={serializedData} />, el);
}
