import MixpanelUtils from '../helpers/mixpanel_utils.jsx';
import Homes from './Homes';

export default function renderHomesMain(el) {
  // imports
  const ReactDOM = window.ReactDOM;

  // entry point, reading static bootstrapped data from the page
  const serializedData = $('#serialized-data').data();
  MixpanelUtils.registerUser(serializedData.currentEducator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'STUDENT_PROFILE' });

  ReactDOM.render(<Homes
    nowMomentFn={function() { return moment.utc(); }}
    notes={serializedData.notes}
  />, el);
}
