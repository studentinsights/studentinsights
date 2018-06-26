import React from 'react';
import moment from 'moment';
import { shallow } from 'enzyme';
import {
  createTestEvents,
  createStudents
} from '../DashboardTestData';
import SchoolAbsenceDashboard from './SchoolAbsenceDashboard';


describe('SchoolAbsenceDashboard', () => {
  const nowMoment = moment.utc();
  const attendance = {'2001-01-01': 50, '2001-01-02': 25, '2001-01-03': 75, '2001-01-04': 100, '2001-02-01': 10};
  const attendanceWithExcused = {'2001-01-01': 50, '2001-01-02': 25, '2001-01-03': 50, '2001-01-04': 100, '2001-02-01': 10};
  const homeroom = {'HR1': attendance, 'No Homeroom': {'2001-01-01': 50, '2001-01-02': 100, '2001-01-03': 100, '2001-01-04': 100, '2001-02-01': 50}};
  const homeroomWithExcused = {'HR1': attendanceWithExcused, 'No Homeroom': {'2001-01-01': 50, '2001-01-02': 100, '2001-01-03': 100, '2001-01-04': 100, '2001-02-01': 50}};
  const students = createStudents(nowMoment);
  const events = createTestEvents(nowMoment);
  const dateRange = ['2001-01-01', '2001-01-02', '2001-01-03', '2001-01-04', '2001-02-01'];
  const dash = shallow(<SchoolAbsenceDashboard
                       schoolAverageDailyAttendance={attendanceWithExcused}
                       schoolAverageDailyAttendanceUnexcused={attendance}
                       homeroomAverageDailyAttendance={homeroomWithExcused}
                       homeroomAverageDailyAttendanceUnexcused={homeroom}
                       dashboardStudents={students}
                       schoolAbsenceEventsByDay={events}
                       schoolUnexcusedAbsenceEventsByDay={events}
                       dateRange={dateRange}/>);

  it('renders two bar charts', () => {
    expect(dash.find('DashboardBarChart').length).toEqual(2);
  });

  it('renders a student list', () => {
    expect(dash.find('StudentsTable').length).toEqual(1);
  });

  it('renders range selection buttons', () => {
    expect(dash.find('DashRangeButtons').length).toEqual(1);
  });

  it('groups the daily attendance within a month', () => {
    const monthly = dash.instance().monthlySchoolAttendance(attendance);
    expect(monthly).toEqual({'2001-01': [50, 25, 75, 100], '2001-02': [10]});
  });

  it('averages the unexcused monthly attendance for the school', () => {
    expect(dash.find('DashboardBarChart').first().props().seriesData).toEqual([62.5,10]);
  });

  it('averages the attendance by homeroom', () => {
    expect(dash.find('DashboardBarChart').last().props().seriesData).toEqual([52,80]);
  });

  it('includes the excused attendance when filter is set', () => {
    dash.setState({showExcused: true});
    expect(dash.find('DashboardBarChart').first().props().seriesData).toEqual([56.3,10]);
    expect(dash.find('DashboardBarChart').last().props().seriesData).toEqual([47,80]);
  });

  it('filters dates outside the range for the school', () => {
    dash.setState({showExcused: false, displayDates:['2001-01-02', '2001-01-03', '2001-01-04']});
    expect(dash.find('DashboardBarChart').first().props().seriesData).toEqual([66.7]);
  });

  it('filters dates outside the range for homerooms', () => {
    expect(dash.find('DashboardBarChart').last().props().seriesData).toEqual([66.7,100]);
  });

});
