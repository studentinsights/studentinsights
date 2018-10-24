import React from 'react';
import moment from 'moment';
import {shallow} from 'enzyme';
import {testContext} from '../../testing/NowContainer';
import {
  createTestEvents,
  createStudents,
  createSchoolTardyEvents,
  testSchool
} from '../DashboardTestData';
import SchoolTardiesDashboard from './SchoolTardiesDashboard';
import {TIME_RANGE_90_DAYS_AGO} from '../../components/SelectTimeRange';

function peekAtChartSeriesData(dash) {
  return dash.find('DashboardBarChart').first().props().seriesData;
}

describe('SchoolTardiesDashboard', () => {
  const nowMoment = moment.utc();
  const students = createStudents(nowMoment);
  const testEvents = createTestEvents(nowMoment);
  const schoolTardyEvents = createSchoolTardyEvents(nowMoment);
  const homeroomTardyEvents = {
    'Test 1': [testEvents.oneMonthAgo, testEvents.fourMonthsAgo],
    'No Homeroom': [testEvents.oneMonthAgo, testEvents.oneYearAgo]
  };

  const context = testContext({nowMoment});
  const dash = shallow(
    <SchoolTardiesDashboard
      school={testSchool}
      schoolTardyEvents={schoolTardyEvents}
      homeroomTardyEvents={homeroomTardyEvents}
      dashboardStudents={students}/>
  , {context});

  it('renders two bar charts', () => {
    expect(dash.find('DashboardBarChart').length).toEqual(2);
  });

  it('renders a student list', () => {
    expect(dash.find('StudentsTable').length).toEqual(1);
  });


  it('sets time range to 45 days by default, and responds to state changes', () => {
    expect(peekAtChartSeriesData(dash).length).toEqual(45);
    dash.setState({timeRangeKey: TIME_RANGE_90_DAYS_AGO});
    expect(peekAtChartSeriesData(dash).length).toEqual(90);
  });

});
