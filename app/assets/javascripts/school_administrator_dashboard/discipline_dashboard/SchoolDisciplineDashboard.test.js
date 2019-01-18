import React from 'react';
import {mount, shallow} from 'enzyme';
import renderer from 'react-test-renderer';
import {toMomentFromTimestamp} from '../../helpers/toMoment';
import {withNowMoment, withNowContext} from '../../testing/NowContainer';
import {pageSizeFrame} from '../../testing/storybookFrames';
import PerDistrictContainer from '../../components/PerDistrictContainer';
import {
  createStudents,
  testSchool,
  testHighSchool
} from '../DashboardTestData';
import SchoolDisciplineDashboard from './SchoolDisciplineDashboard';

jest.mock('react-virtualized'); // doesn't work in test without a real DOM

function setDate() {
  return toMomentFromTimestamp('2018-09-22T17:03:06.123Z');
}

function testContext(context = {}) {
  const nowMoment = setDate();
  return {
    districtKey: 'somerville',
    nowFn() { return nowMoment; },
    ...context
  };
}

function testEl(props = {}) {
  return <SchoolDisciplineDashboard {...props} />;
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
  const el = testEl(props);
  return shallow(el, {context});
}

function create501Students() {
  const now = setDate();
  let students = [];
  for (let i=0; i < 501; i++) {
    const student = {
      first_name: 'Pierrot',
      last_name: 'Zanni',
      homeroom_label: 'Test 1',
      grade: '4',
      id: 1,
      discipline_incidents: [{
        id:23,
        incident_code:"Assault",
        created_at: now.clone().subtract(30, 'days').format(),
        incident_location:"Playground",
        incident_description:"Description",
        occurred_at: now.clone().subtract(30, 'days').format(),
        has_exact_time:true,
        student_id:1}],
      events: 3
    };
    students.push(student);
  }
  return students;
}

it('displays house for SHS', () => {
  const context = testContext({districtKey: 'somerville'});
  const props = {school: testHighSchool(), dashboardStudents: createStudents(setDate())};
  const el = testEl(props);
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.find('SelectHouse').length > 0).toEqual(true);
});

it('does not display house for Healey', () => {
  const context = testContext({districtKey: 'somerville'});
  const props = {school: testSchool(), dashboardStudents: createStudents(setDate())};
  const el = testEl(props);
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.find('SelectHouse').length > 0).toEqual(false);
});

it('displays counselor for SHS', () => {
  const context = testContext({districtKey: 'somerville'});
  const props = {school: testHighSchool(), dashboardStudents: createStudents(setDate())};
  const el = testEl(props);
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.find('SelectCounselor').length > 0).toEqual(true);
});

it('does not display counselor for Healey', () => {
  const context = testContext({districtKey: 'somerville'});
  const props = {school: testSchool(), dashboardStudents: createStudents(setDate())};
  const el = testEl(props);
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.find('SelectCounselor').length > 0).toEqual(false);
});

it('displays grade for SHS', () => {
  const context = testContext({districtKey: 'somerville'});
  const props = {school: testHighSchool(), dashboardStudents: createStudents(setDate())};
  const el = testEl(props);
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.find('SelectGrade').length > 0).toEqual(true);
});

it('displays grade for Healey', () => {
  const context = testContext({districtKey: 'somerville'});
  const props = {school: testSchool(), dashboardStudents: createStudents(setDate())};
  const el = testEl(props);
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.find('SelectGrade').length > 0).toEqual(true);
});

it('renders a scatter plot', () => {
  const context = testContext({districtKey: 'somerville'});
  const props = {school: testSchool(), dashboardStudents: createStudents(setDate())};
  const el = testEl(props);
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.find('DisciplineScatterPlot').length > 0).toEqual(true);
});

it('does not render a scatter plot when there are more than 500 incidents', () => {
  const context = testContext({districtKey: 'somerville'});
  const props = {school: testSchool(), dashboardStudents: create501Students(setDate())};
  const el = testEl(props);
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.find('DisciplineScatterPlot').length === 0).toEqual(true);
  expect(dash.find('ScatterPlotOverloadMessage').length > 0).toEqual(true);
});

it('renders a student list', () => {
  const context = testContext({districtKey: 'somerville'});
  const props = {school: testSchool(), dashboardStudents: createStudents(setDate())};
  const el = testEl(props);
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.find('StudentsTable').length > 0).toEqual(true);
});

it('renders a date range selector', () => {
  const context = testContext({districtKey: 'somerville'});
  const props = {school: testSchool(), dashboardStudents: createStudents(setDate())};
  const el = testEl(props);
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.find('SelectTimeRange').length > 0).toEqual(true);
});

it('can render a bar chart', () => {
  const dash = renderShallow({school: testSchool(), dashboardStudents: createStudents(setDate())});
  dash.setState({selectedChart: 'grade'});
  expect(dash.find('DashboardBarChart').length > 0).toEqual(true);
});

function snapshotJson(districtKey) {
  return renderer.create(
    withNowContext('2018-09-22T17:03:06.123Z',
      <PerDistrictContainer districtKey={districtKey}>
        {pageSizeFrame(testEl({school: testSchool(), dashboardStudents: createStudents(setDate())}))}
      </PerDistrictContainer>
  ));
}

describe('snapshots', () => {
  it('works for demo', () => expect(snapshotJson('demo')).toMatchSnapshot());
  it('works for somerville', () => expect(snapshotJson('somerville')).toMatchSnapshot());
  it('works for new_bedford', () => expect(snapshotJson('new_bedford')).toMatchSnapshot());
  it('works for bedford', () => expect(snapshotJson('bedford')).toMatchSnapshot());
});
