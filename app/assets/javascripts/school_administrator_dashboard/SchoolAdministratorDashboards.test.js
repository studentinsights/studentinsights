import React from 'react';
import { shallow } from 'enzyme';
import * as Data from './DashboardTestData';
import SchoolAdministratorDashboards from './SchoolAdministratorDashboards';


it('renders three routes', () => {
  const links = shallow(<SchoolAdministratorDashboards serializedData={{students: Data.Students}} />);
  expect(links.find('Route').length).toEqual(3);
});
