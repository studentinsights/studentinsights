import React from 'react';
import { shallow } from 'enzyme';

import SchoolAbsenceDashboard from '../../../app/assets/javascripts/school_administrator_dashboard/dashboard_components/absences_dashboard/school_absence_dashboard.jsx';
import * as Data from './DashboardTestData.js';

describe('SchoolAbsenceDashboard', () => {
  const attendance = {'2001-01-01': 50, '2001-01-02': 25, '2001-01-03': 75, '2001-01-04': 100, '2001-02-01': 10};
  const homeroom = {'HR1': attendance, 'No Homeroom': {'2001-01-01': 50, '2001-01-02': 100, '2001-01-03': 100, '2001-01-04': 100, '2001-02-01': 50}};
  const students = Data.Students;
  const events = Data.testEvents;
  const dateRange = ['2001-01-01', '2001-01-02', '2001-01-03', '2001-01-04', '2001-02-01'];
  const dash = shallow(<SchoolAbsenceDashboard
                       schoolAverageDailyAttendance={attendance}
                       homeroomAverageDailyAttendance={homeroom}
                       dashboardStudents={students}
                       schoolAbsenceEvents={events}
                       dateRange={dateRange}/>);

  it('renders two bar charts', () => {
    expect(dash.find('DashboardBarChart').length).toEqual(2);
  });

  it('renders a student list', () => {
    expect(dash.find('StudentsTable').length).toEqual(1);
  });

  it('renders a date slider', () => {
    expect(dash.find('DateSlider').length).toEqual(1);
  });

  it('groups the daily attendance within a month', () => {
    const monthly = dash.instance().monthlySchoolAttendance(attendance);
    expect(monthly).toEqual({'2001-01': [50, 25, 75, 100], '2001-02': [10]});
  });

  it('averages the monthly attendance for the school', () => {
    expect(dash.find('DashboardBarChart').first().props().seriesData).toEqual([62.5,10]);
  });

  it('averages the attendance by homeroom', () => {
    expect(dash.find('DashboardBarChart').last().props().seriesData).toEqual([52,80]);
  });

  it('filters dates outside the range for the school', () => {
    dash.instance().setDate([moment('2001-01-02').format('X'), moment('2001-01-04').format('X')]);
    dash.update();
    expect(dash.find('DashboardBarChart').first().props().seriesData).toEqual([87.5]);
  });

  it('filters dates outside the range for homerooms', () => {
    expect(dash.find('DashboardBarChart').last().props().seriesData).toEqual([87.5,100]);
  });

});
