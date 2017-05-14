import PlacesPage from './places_page.jsx';
const ReactDOM = window.ReactDOM;

$(function() {
  // only run if the correct page
  if (!($('body').hasClass('schools') && $('body').hasClass('places'))) return;

  // imports
  const parseQueryString = window.shared.parseQueryString;
  const MixpanelUtils = window.shared.MixpanelUtils;

  // entry point, reading static bootstrapped data from the page
  const serializedData = $('#serialized-data').data();
  const {currentEducator, plots, schools} = serializedData;
  MixpanelUtils.registerUser(currentEducator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'PLACES' });

  // render
  ReactDOM.render(<PlacesPage schools={schools} plots={plots} />, document.getElementById('main'));
});
