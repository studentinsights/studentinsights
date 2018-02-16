import React from 'react';
import { shallow } from 'enzyme';

import SchoolTardiesDashboard from '../../../app/assets/javascripts/school_administrator_dashboard/dashboard_components/tardies_dashboard/SchoolTardiesDashboard.jsx';
import * as Data from './DashboardTestData.js';

describe('SchoolTardiesDashboard', () => {
  const schoolTardyEvents = Data.schoolTardyEvents();
  const homeroomTardyEvents = {'Test 1': [Data.testEvents.oneMonthAgo, Data.testEvents.fourMonthsAgo], 'No Homeroom': [Data.testEvents.oneMonthAgo, Data.testEvents.oneYearAgo]};
  const students = Data.Students;
  const dash = shallow(<SchoolTardiesDashboard
                       schoolTardyEvents={schoolTardyEvents}
                       homeroomTardyEvents={homeroomTardyEvents}
                       dashboardStudents={students}/>);

  it('renders two bar charts', () => {
    expect(dash.find('DashboardBarChart').length).toEqual(2);
  });

  it('renders a student list', () => {
    expect(dash.find('StudentsTable').length).toEqual(1);
  });


  it('displays only the past 3 months of total school data', () => {
    const seriesData = dash.find('DashboardBarChart').first().props().seriesData;
    expect(seriesData[0][0]).toEqual(moment(Data.testEvents.threeMonthsAgo.occurred_at).format('ddd MM/DD'));
  });

});
