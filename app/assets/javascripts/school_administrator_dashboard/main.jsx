import { HashRouter } from 'react-router-dom';

import SchoolAdministratorDashboards from  './dashboard_components/school_administrator_dashboards.jsx';
import MixpanelUtils from '../helpers/mixpanel_utils.jsx';

export default function renderSchoolAdminDashboardMain(el) {
  const serializedData = $('#serialized-data').data();
  MixpanelUtils.registerUser(serializedData.currentEducator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_DASHBOARD' });
  window.ReactDOM.render(
    <HashRouter>
      <SchoolAdministratorDashboards
      serializedData={serializedData}/>
    </HashRouter>,
    el
  );
}
