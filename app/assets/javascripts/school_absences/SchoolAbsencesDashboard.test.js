import React from 'react';
import {mount, shallow} from 'enzyme';
import renderer from 'react-test-renderer';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import {withNowMoment, withNowContext} from '../testing/NowContainer';
import {pageSizeFrame} from '../testing/storybookFrames';
import PerDistrictContainer from '../components/PerDistrictContainer';
import {ALL_ABSENCES} from './SelectExcusedAbsences';
import SchoolAbsencesDashboard from './SchoolAbsencesDashboard';
import absencesJson from './absencesJson.fixture.js';


jest.mock('react-virtualized'); // doesn't work in test without a real DOM


function testContext(context = {}) {
  const nowMoment = toMomentFromTimestamp('2018-09-22T17:03:06.123Z');
  return {
    districtKey: 'somerville',
    nowFn() { return nowMoment; },
    ...context
  };
}

function testEl(moreProps = {}) {
  const props = {
    studentsWithAbsences: absencesJson.students_with_events,
    school: absencesJson.school,
    ...moreProps
  };
  return <SchoolAbsencesDashboard {...props} />;
}

function homeroomAveragesSeries(dash) {
  return dash.find('DashboardBarChart').last().props().seriesData;
}
function overallDataPoint(dash) {
  return dash.find('DashboardBarChart').first().props().seriesData[0];
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
  expect(dash.html()).not.toContain('Unexcused Absences Only');
  expect(dash.html()).not.toContain('All Absences');
  expect(dash.find('SelectExcusedAbsences').length).toEqual(0);
});

it('does show excused absence option for Somerville', () => {
  const context = testContext({districtKey: 'somerville'});
  const el = testEl();
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.html()).toContain('Unexcused Absences Only');
  expect(dash.html()).toContain('All Absences');
  expect(dash.find('SelectExcusedAbsences').length).toEqual(1);
});

it('does show excused absence option for Bedford', () => {
  const context = testContext({districtKey: 'bedford'});
  const el = testEl();
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.html()).toContain('Unexcused Absences Only');
  expect(dash.html()).toContain('All Absences');
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

  it('renders overall', () => {
    const dash = renderShallow();
    expect(overallDataPoint(dash)).toEqual({
      absencesCount: 4,
      attendanceRate: 99.074,
      studentsCount: 72,
      studentDays: 432,
      y: 99.074
    });
  });

  it('renders different values for monthly averages when excused is flipped', () => {
    const dash = renderShallow();
    const unexcusedDataPoint = overallDataPoint(dash);
    dash.setState({excusedAbsencesKey: ALL_ABSENCES});
    const allDataPoint = overallDataPoint(dash);
    expect(allDataPoint).not.toEqual(unexcusedDataPoint);
    expect(allDataPoint).toEqual({
      absencesCount: 7,
      attendanceRate: 98.38,
      studentsCount: 72,
      studentDays: 432,
      y: 98.38
    });
  });

  it('can filter by house', () => {
    const dash = renderShallow();
    dash.setState({house: 'Broadway'});
    expect(overallDataPoint(dash)).toEqual({
      studentsCount: 22,
      absencesCount: 2,
      studentDays: 132,
      attendanceRate: 98.485,
      y: 98.485
    });
  });

  it('can filter by grade', () => {
    const dash = renderShallow();
    dash.setState({grade: '10'});
    expect(overallDataPoint(dash)).toEqual({
      studentsCount: 54,
      absencesCount: 4,
      studentDays: 324,
      attendanceRate: 98.765,
      y: 98.765
    });
  });

  it('can filter by counselor', () => {
    const dash = renderShallow();
    dash.setState({counselor: 'SOFIA'});
    expect(overallDataPoint(dash)).toEqual({
      studentsCount: 32,
      absencesCount: 1,
      studentDays: 192,
      attendanceRate: 99.479,
      y: 99.479
    });
  });

  it('can filter to zero students without raising', () => {
    const dash = renderShallow();
    dash.setState({house: 'Beacon', counselor: 'FISHMAN'});
    expect(overallDataPoint(dash)).toEqual({
      studentsCount: 0,
      absencesCount: 0,
      studentDays: 0,
      attendanceRate: null,
      y: null
    });
  });

  it('renders the attendance by homeroom', () => {
    const dash = renderShallow();
    expect(homeroomAveragesSeries(dash)).toEqual([{
      "absencesCount": 4,
      "attendanceRate": 98.765,
      "color": null,
      "homeroomLabel": "SHS ALL",
      "studentDays": 324,
      "studentsCount": 54,
      "y": 98.765
    }, {
      "absencesCount": 0,
      "attendanceRate": 100,
      "color": null,
      "homeroomLabel": "Teacher, Jodi",
      "studentDays": 60,
      "studentsCount": 10,
      "y": 100
    }, {
      "absencesCount": 0,
      "attendanceRate": 100,
      "color": null,
      "homeroomLabel": "Teacher, Bill",
      "studentDays": 48,
      "studentsCount": 8,
      "y": 100
    }]);
  });
});


it('snapshots', () => {
  const el = (
    withNowContext('2018-09-22T17:03:06.123Z',
      <PerDistrictContainer districtKey="demo">
        {pageSizeFrame(testEl())}
      </PerDistrictContainer>
    )
  );
  const tree = renderer.create(el);
  expect(tree.toJSON()).toMatchSnapshot();
});