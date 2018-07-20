import React from 'react';
import moment from 'moment';
import {mount, shallow} from 'enzyme';
import {withNowMoment} from '../../testing/NowContainer';
import PerDistrictContainer from '../../components/PerDistrictContainer';
import {
  createTestEvents,
  createStudents,
  testSchool
} from '../DashboardTestData';
import SchoolAbsenceDashboard from './SchoolAbsenceDashboard';


function testSetup(options = {}) {
  const districtKey = options.districtKey || 'somerville';
  const nowMoment = moment.utc();
  const attendance = {'2001-01-01': 50, '2001-01-02': 25, '2001-01-03': 75, '2001-01-04': 100, '2001-02-01': 10};
  const attendanceWithExcused = {'2001-01-01': 50, '2001-01-02': 25, '2001-01-03': 50, '2001-01-04': 100, '2001-02-01': 10};
  const homeroom = {'HR1': attendance, 'No Homeroom': {'2001-01-01': 50, '2001-01-02': 100, '2001-01-03': 100, '2001-01-04': 100, '2001-02-01': 50}};
  const homeroomWithExcused = {'HR1': attendanceWithExcused, 'No Homeroom': {'2001-01-01': 50, '2001-01-02': 100, '2001-01-03': 100, '2001-01-04': 100, '2001-02-01': 50}};
  const students = createStudents(nowMoment);
  const events = createTestEvents(nowMoment);
  const dateRange = ['2001-01-01', '2001-01-02', '2001-01-03', '2001-01-04', '2001-02-01'];
  const context = {
    districtKey,
    nowFn() { return nowMoment; }
  };
  const el = (
    <SchoolAbsenceDashboard
      school={testSchool()} 
      schoolAverageDailyAttendance={attendanceWithExcused}
      schoolAverageDailyAttendanceUnexcused={attendance}
      homeroomAverageDailyAttendance={homeroomWithExcused}
      homeroomAverageDailyAttendanceUnexcused={homeroom}
      dashboardStudents={students}
      schoolAbsenceEventsByDay={events}
      schoolUnexcusedAbsenceEventsByDay={events}
      dateRange={dateRange}/>
  );
  return {el, context, attendance};
}

// mount doesn't support passing context directly, and shallow doesn't
// work with wrapper components, that's why there's extra setup to translate
// between
function elWrappedInContext(el, context) {
  const {districtKey, nowFn} = context;
  return withNowMoment(nowFn(), (
    <PerDistrictContainer districtKey={districtKey}>{el}</PerDistrictContainer>
  ));
}

it('does not show excused absence option for New Bedford', () => {
  const {el, context} = testSetup({districtKey: 'new_bedford'});
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.html()).not.toContain('Unexcused Absences Only');
  expect(dash.html()).not.toContain('All Absences');
  expect(dash.find('SelectExcusedAbsences').length).toEqual(0);
});

describe('with testSetup', () => {
  const {el, context, attendance} = testSetup();
  const dash = shallow(el, {context});

  it('renders two bar charts', () => {
    expect(dash.find('DashboardBarChart').length).toEqual(2);
  });

  it('renders a student list', () => {
    expect(dash.find('StudentsTable').length).toEqual(1);
  });

  it('renders range selection buttons', () => {
    expect(dash.find('FilterBar').length).toEqual(2);
    expect(dash.find('SelectTimeRange').length).toEqual(1);
    expect(dash.find('SelectExcusedAbsences').length).toEqual(1);
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
