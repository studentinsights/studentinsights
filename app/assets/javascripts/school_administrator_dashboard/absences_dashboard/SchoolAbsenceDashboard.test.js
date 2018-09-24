import React from 'react';
import {mount, shallow} from 'enzyme';
import {toMomentFromTimestamp} from '../../helpers/toMoment';
import {withNowMoment} from '../../testing/NowContainer';
import {TIME_RANGE_90_DAYS_AGO, TIME_RANGE_SCHOOL_YEAR} from '../../components/SelectTimeRange';
import {ALL_ABSENCES} from './SelectExcusedAbsences';
import PerDistrictContainer from '../../components/PerDistrictContainer';
import {fixtureProps} from './SchoolAbsenceDashboard.fixtures';
import SchoolAbsenceDashboard, {monthlySchoolAttendance} from './SchoolAbsenceDashboard';

function testContext(context = {}) {
  const nowMoment = toMomentFromTimestamp('2018-07-20T17:03:06.123Z');
  return {
    districtKey: 'somerville',
    nowFn() { return nowMoment; },
    ...context
  };
}
function testEl(moreProps = {}) {
  const props = {
    ...fixtureProps(),
    ...moreProps
  };
  return <SchoolAbsenceDashboard {...props} />;
}

function homeroomAveragesSeries(dash) {
  return dash.find('DashboardBarChart').last().props().seriesData;
}
function monthlyAverageSeries(dash) {
  return dash.find('DashboardBarChart').first().props().seriesData;
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

function renderShallow(props = {}) {
  const context = testContext();
  const el = testEl();
  return shallow(el, {context});
}

it('does not show excused absence option for New Bedford', () => {
  const context = testContext({districtKey: 'new_bedford'});
  const el = testEl();
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.html()).not.toContain('Unexcused');
  expect(dash.find('SelectExcusedAbsences').length).toEqual(0);
});

it('does show excused absence option for Somerville', () => {
  const context = testContext({districtKey: 'somerville'});
  const el = testEl();
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.html()).toContain('Unexcused');
  expect(dash.find('SelectExcusedAbsences').length).toEqual(1);
});

it('does show excused absence option for Bedford', () => {
  const context = testContext({districtKey: 'bedford'});
  const el = testEl();
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.html()).toContain('Unexcused');
  expect(dash.find('SelectExcusedAbsences').length).toEqual(1);
});

describe('with testSetup', () => {
  it('renders two bar charts', () => {
    expect(renderShallow().find('DashboardBarChart').length).toEqual(2);
  });

  it('renders a student list', () => {
    expect(renderShallow().find('StudentsTable').length).toEqual(1);
  });

  it('renders range selection buttons', () => {
    const dash = renderShallow();
    expect(dash.find('FilterBar').length).toEqual(2);
    expect(dash.find('SelectTimeRange').length).toEqual(1);
    expect(dash.find('SelectExcusedAbsences').length).toEqual(1);
  });

  it('renders daily averages for defaults', () => {
    const dash = renderShallow();
    expect(monthlyAverageSeries(dash)).toEqual([99.5, 99.6]);
  });

  it('renders different values when the time range changes', () => {
    const dash = renderShallow();
    dash.setState({timeRangeKey: TIME_RANGE_90_DAYS_AGO});
    expect(monthlyAverageSeries(dash)).toEqual([99.6, 99.7, 99.5, 99.6]);
  });

  it('can render values for a whole year', () => {
    const dash = renderShallow();
    dash.setState({timeRangeKey: TIME_RANGE_SCHOOL_YEAR});
    expect(monthlyAverageSeries(dash).length).toEqual(12);
  });

  it('renders different values for monthly averages when excused is flipped', () => {
    const dash = renderShallow();
    // Fixtures don't happen to show a different for these over 45 days, so 90 is used here
    const excusedMonthlyAverages = monthlyAverageSeries(dash);
    dash.setState({
      excusedAbsencesKey: ALL_ABSENCES,
      timeRangeKey: TIME_RANGE_90_DAYS_AGO
    });
    const allAbsencesMonthlyAverages = monthlyAverageSeries(dash);
    expect(excusedMonthlyAverages).not.toEqual(allAbsencesMonthlyAverages);
  });

  it('renders the attendance by homeroom', () => {
    const dash = renderShallow();
    expect(homeroomAveragesSeries(dash)).toEqual([99, 99.2, 99.2, 99.2, 99.2, 99.3, 99.3, 99.3, 99.4, 99.4, 99.5, 99.5, 99.5, 99.5, 99.5, 99.5, 99.6, 99.6, 99.6, 99.8, 99.8, 99.8, 99.8, 99.8, 99.8, 99.8, 100, 100, 100, 100, 100]);
  });
});

describe('unit tests', () => {
  it('#monthlySchoolAttendance groups the daily attendance within a month', () => {
    const displayDates = [
      '2018-01-01',
      '2018-01-02',
      '2018-01-03',
      '2018-01-04',
      '2018-02-01'
    ];
    const averageDailyAttendance = {
      '2018-01-01': 50,
      '2018-01-02': 25,
      '2018-01-03': 75,
      '2018-01-04': 100,
      '2018-02-01': 10
    };
    expect(monthlySchoolAttendance(displayDates, averageDailyAttendance)).toEqual({
      ['2018-01']: [50, 25, 75, 100],
      ['2018-02']: [10]
    });
  });
});