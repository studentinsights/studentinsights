import MixpanelUtils from '../helpers/mixpanel_utils.jsx';

export default function renderStudentMain(el) {
  // imports
  const ReactDOM = window.ReactDOM;
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
    history={window.history} />, el);
}