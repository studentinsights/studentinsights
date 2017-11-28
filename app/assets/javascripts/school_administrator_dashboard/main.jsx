import PageContainer from  './page_container.jsx';
import MixpanelUtils from '../helpers/MixpanelUtils';

export default function renderSchoolAdminDashboardMain(el) {
  const serializedData = $('#serialized-data').data();
  MixpanelUtils.registerUser(serializedData.currentEducator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_DASHBOARD' });
  window.ReactDOM.render(<PageContainer attendanceData={serializedData} />, el);
}
