import React from 'react';
import { shallow } from 'enzyme';

import SchoolwideTardies from '../../../app/assets/javascripts/school_administrator_dashboard/dashboard_components/tardies_dashboard/schoolwide_tardies.jsx';
import * as Data from './DashboardTestData.js';

describe('SchoolwideTardies', () => {
  const tardies = shallow(<SchoolwideTardies dashboardStudents={Data.Students} />);

  it('renders the school tardies dashboard', () => {
    expect(tardies.find('SchoolTardiesDashboard').length).toEqual(1);
  });

  it('filters out tardies outside the school year', () => {
    //Test 2 homeroom has one tardy event in the current month and one a year ago
    expect(tardies.find('SchoolTardiesDashboard').props().homeroomTardyEvents['Test 2']).toEqual(1);
  });
});
