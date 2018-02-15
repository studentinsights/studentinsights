import React from 'react';
import { shallow } from 'enzyme';

import SchoolAdministratorDashboards from '../../../app/assets/javascripts/school_administrator_dashboard/dashboard_components/school_administrator_dashboards.jsx';
import * as Data from './DashboardTestData.js';

describe('SchoolAdministratorDashboards', () => {
  const links = shallow(<SchoolAdministratorDashboards serializedData={{students: Data.Students}} />);
  it('renders three routes', () => {
    expect(links.find('Route').length).toEqual(3);
  });
});
