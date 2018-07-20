import React from 'react';
import moment from 'moment';
import { shallow } from 'enzyme';
import {
  createTestEvents,
  createStudents,
  createSchoolTardyEvents,
  testSchool
} from '../DashboardTestData';
import SchoolTardiesDashboard from './SchoolTardiesDashboard';

describe('SchoolTardiesDashboard', () => {
  const nowMoment = moment.utc();
  const students = createStudents(nowMoment);
  const testEvents = createTestEvents(nowMoment);
  const schoolTardyEvents = createSchoolTardyEvents(nowMoment);
  const homeroomTardyEvents = {
    'Test 1': [testEvents.oneMonthAgo, testEvents.fourMonthsAgo],
    'No Homeroom': [testEvents.oneMonthAgo, testEvents.oneYearAgo]
  };

  const dash = shallow(<SchoolTardiesDashboard
                       school={testSchool()}
                       schoolTardyEvents={schoolTardyEvents}
                       homeroomTardyEvents={homeroomTardyEvents}
                       dashboardStudents={students}/>);

  it('renders two bar charts', () => {
    expect(dash.find('DashboardBarChart').length).toEqual(2);
  });

  it('renders a student list', () => {
    expect(dash.find('StudentsTable').length).toEqual(1);
  });


  it('filters events outside the start date', () => {
    dash.setState({startDate: moment.utc(testEvents.fourMonthsAgo.occurred_at).format("YYYY-MM-DD")});
    const seriesData = dash.find('DashboardBarChart').first().props().seriesData;
    expect(seriesData[0][0]).toEqual(moment.utc(testEvents.fourMonthsAgo.occurred_at).format('ddd MM/DD/YYYY'));
  });

});
