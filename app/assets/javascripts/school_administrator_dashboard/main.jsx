import PageContainer from  './page_container.jsx';
import MixpanelUtils from '../helpers/mixpanel_utils.jsx';
const ReactDOM = window.ReactDOM;

$(function() {
  if ($('body').hasClass('school_administrator_dashboard') && $('body').hasClass('show')) {

    const serializedData = $('#serialized-data').data();
    MixpanelUtils.registerUser(serializedData.currentEducator);
    MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_OVERVIEW_DASHBOARD' });
    window.ReactDOM.render(<PageContainer
      attendanceData={serializedData} />, document.getElementById('main'));
  }
});
