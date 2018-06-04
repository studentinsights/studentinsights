import React from 'react';
import moment from 'moment';
import { shallow } from 'enzyme';
import {createStudents} from '../DashboardTestData';
import SchoolwideTardies from './SchoolwideTardies';


it('renders the school tardies dashboard', () => {
  const tardies = shallow(<SchoolwideTardies dashboardStudents={createStudents(moment.utc())} />);
  expect(tardies.find('SchoolTardiesDashboard').length).toEqual(1);
});
