import SchoolwideAbsences from  './schoolwide_absences.jsx';
import MixpanelUtils from '../helpers/MixpanelUtils';

export default function renderSchoolAdminDashboardMain(el) {
  const serializedData = $('#serialized-data').data();
  MixpanelUtils.registerUser(serializedData.currentEducator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_DASHBOARD' });
  window.ReactDOM.render(<SchoolwideAbsences dashboardStudents={serializedData.students} />, el);
}
