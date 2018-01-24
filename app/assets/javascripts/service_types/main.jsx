import MixpanelUtils from '../helpers/mixpanel_utils.jsx';
import IsServiceWorking from '../service_types/IsServiceWorking.js';

export default function renderIsServiceWorking() {
  const ReactDOM = window.ReactDOM;
  const serializedData = $('#serialized-data').data();

  ReactDOM.render(
    <IsServiceWorking
      chartData={serializedData.chartData}
    />,
    document.getElementById('main')
  );
}
