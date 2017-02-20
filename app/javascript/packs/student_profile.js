import PageContainer from './student_profile/page_container.jsx';
import ReactDOM from 'react-dom';
import moment from 'moment';


document.addEventListener("DOMContentLoaded", e => {
  // imports
  var createEl = window.shared.ReactHelpers.createEl;
  var parseQueryString = window.shared.parseQueryString;
  var MixpanelUtils = window.shared.MixpanelUtils;
  var $ = window.$;

  // entry point, reading static bootstrapped data from the page
  var serializedData = $('#serialized-data').data();
  MixpanelUtils.registerUser(serializedData.currentEducator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'STUDENT_PROFILE' });

  ReactDOM.render(createEl(PageContainer, {
    nowMomentFn: function() { return moment.utc(); },
    serializedData: serializedData,
    queryParams: parseQueryString(window.location.search),
    history: window.history
  }), document.getElementById('main'));
});
