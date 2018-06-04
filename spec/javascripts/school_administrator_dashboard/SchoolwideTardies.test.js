import React from 'react';
import moment from 'moment';
import { shallow } from 'enzyme';

import SchoolwideTardies from '../../../app/assets/javascripts/school_administrator_dashboard/dashboard_components/tardies_dashboard/SchoolwideTardies';
import {createStudents} from './DashboardTestData';

describe('SchoolwideTardies', () => {
  const tardies = shallow(<SchoolwideTardies dashboardStudents={createStudents(moment.utc())} />);

  it('renders the school tardies dashboard', () => {
    expect(tardies.find('SchoolTardiesDashboard').length).toEqual(1);
  });
});
