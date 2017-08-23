import MixpanelUtils from '../helpers/mixpanel_utils.jsx';
const ReactDOM = window.ReactDOM;

$(function() {
  // only run if the correct page
  if (!($('body').hasClass('students') && $('body').hasClass('show'))) return;

  // imports
  const PageContainer = window.shared.PageContainer;
  const parseQueryString = window.shared.parseQueryString;

  // entry point, reading static bootstrapped data from the page
  const serializedData = $('#serialized-data').data();
  MixpanelUtils.registerUser(serializedData.currentEducator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'STUDENT_PROFILE' });

  ReactDOM.render(<PageContainer
    nowMomentFn={function() { return moment.utc(); }}
    serializedData={serializedData}
    queryParams={parseQueryString(window.location.search)}
    history={window.history} />, document.getElementById('main'));
});
