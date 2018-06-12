import React from 'react';
import moment from 'moment';
import { shallow } from 'enzyme';
import { createStudents } from '../DashboardTestData';
import SchoolDisciplineDashboard from './SchoolDisciplineDashboard';


describe('SchoolDisciplineDashboard', () => {
  const dash = shallow(<SchoolDisciplineDashboard
                        dashboardStudents={createStudents(moment.utc())}
                        schoolDisciplineEvents={[]}/>);

  it('renders at least one bar chart', () => {
    expect(dash.find('DashboardBarChart').length > 0).toEqual(true);
  });

  it('renders a student list', () => {
    expect(dash.find('StudentsTable').length).toEqual(1);
  });

  it('renders a date range selector', () => {
    expect(dash.find('DashRangeButtons').length).toEqual(1);
  });
});
