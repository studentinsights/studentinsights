import React from 'react';
import moment from 'moment';
import {mount} from 'enzyme';
import {
  createStudents,
  testSchool
} from '../DashboardTestData';
import SchoolDisciplineDashboard from './SchoolDisciplineDashboard';
import {withDefaultNowContext} from '../../testing/NowContainer';


describe('SchoolDisciplineDashboard', () => {
  const dash = mount(withDefaultNowContext(
    <SchoolDisciplineDashboard
      school={testSchool()}
      dashboardStudents={createStudents(moment.utc())}
      schoolDisciplineEvents={[]} />
  ));

  it('renders at least one bar chart', () => {
    expect(dash.find('DashboardBarChart').length > 0).toEqual(true);
  });

  it('renders a student list', () => {
    expect(dash.find('StudentsTable').length).toEqual(1);
  });

  it('renders a date range selector', () => {
    expect(dash.find('SelectTimeRange').length).toEqual(1);
  });
});
