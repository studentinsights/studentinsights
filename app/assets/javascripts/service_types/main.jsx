import MixpanelUtils from '../helpers/mixpanel_utils.jsx';

export default function renderIsServiceWorking() {
  const ReactDOM = window.ReactDOM;

  // track user for mixpanel
  const currentEducator = $('#current-educator-data').data().currentEducator;
  MixpanelUtils.registerUser(currentEducator);
  MixpanelUtils.track('PAGE_VISIT', {
    page_key: 'IS_SERVICE_WORKING',
  });

  // entry point, reading static bootstrapped data from the page
  const serializedData = $('#serialized-data').data();

  ReactDOM.render(
    <IsServiceWorking
      serializedData={serializedData.showStar}
    />,
    document.getElementById('main')
  );
}
