import SchoolwideAttendance from  './schoolwide_attendance.jsx';
import MixpanelUtils from '../helpers/mixpanel_utils.jsx';

export default function renderSchoolAdminDashboardMain(el) {
  const serializedData = $('#serialized-data').data();
  MixpanelUtils.registerUser(serializedData.currentEducator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_DASHBOARD' });
  window.ReactDOM.render(<SchoolwideAttendance dashboardStudents={serializedData.students} />, el);
}
