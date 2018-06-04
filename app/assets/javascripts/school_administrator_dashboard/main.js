import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter} from 'react-router-dom';
import measurePageLoad from '../helpers/measurePageLoad';
import SchoolAdministratorDashboards from  './dashboard_components/SchoolAdministratorDashboards';
import MixpanelUtils from '../helpers/MixpanelUtils';

export default function renderSchoolAdminDashboardMain(el) {
  const serializedData = $('#serialized-data').data();
  MixpanelUtils.registerUser(serializedData.currentEducator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_DASHBOARD' });

  ReactDOM.render(
    <HashRouter>
      <SchoolAdministratorDashboards
      serializedData={serializedData}/>
    </HashRouter>,
    el
  );

  measurePageLoad(info => console.log(JSON.stringify(info, null, 2))); // eslint-disable-line no-console
}
