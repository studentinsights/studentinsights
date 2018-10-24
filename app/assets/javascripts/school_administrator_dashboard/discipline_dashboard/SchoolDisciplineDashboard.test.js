import React from 'react';
import {shallow, mount} from 'enzyme';
import moment from 'moment';
import {toMomentFromTimestamp} from '../../helpers/toMoment';
import {withNowMoment} from '../../testing/NowContainer';
import PerDistrictContainer from '../../components/PerDistrictContainer';
import {
  createStudents,
  testSchool,
  testHighSchool
} from '../DashboardTestData';
import SchoolDisciplineDashboard from './SchoolDisciplineDashboard';

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
    dashboardStudents: createStudents(moment.utc()),
    ...moreProps
  };
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

it('displays house for SHS', () => {
  const context = testContext({districtKey: 'somerville'});
  const props = {school: testHighSchool};
  const el = testEl(props);
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.find('SelectHouse').length > 0).toEqual(true);
});

it('does not display house for Healy', () => {
  const context = testContext({districtKey: 'somerville'});
  const props = {school: testSchool};
  const el = testEl(props);
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.find('SelectHouse').length > 0).toEqual(false);
});

it('displays counselor for SHS', () => {
  const context = testContext({districtKey: 'somerville'});
  const props = {school: testHighSchool};
  const el = testEl(props);
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.find('SelectCounselor').length > 0).toEqual(true);
});

it('does not display counselor for Healy', () => {
  const context = testContext({districtKey: 'somerville'});
  const props = {school: testSchool};
  const el = testEl(props);
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.find('SelectCounselor').length > 0).toEqual(false);
});

it('displays grade for SHS', () => {
  const context = testContext({districtKey: 'somerville'});
  const props = {school: testHighSchool};
  const el = testEl(props);
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.find('SelectGrade').length > 0).toEqual(true);
});

it('displays grade for Healy', () => {
  const context = testContext({districtKey: 'somerville'});
  const props = {school: testSchool};
  const el = testEl(props);
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.find('SelectGrade').length > 0).toEqual(true);
});

it('renders at least one bar chart', () => {
  const context = testContext({districtKey: 'somerville'});
  const props = {school: testSchool};
  const el = testEl(props);
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.find('DashboardBarChart').length > 0).toEqual(true);
});

it('renders a student list', () => {
  const context = testContext({districtKey: 'somerville'});
  const props = {school: testSchool};
  const el = testEl(props);
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.find('StudentsTable').length > 0).toEqual(true);
});

it('renders a date range selector', () => {
  const context = testContext({districtKey: 'somerville'});
  const props = {school: testSchool};
  const el = testEl(props);
  const dash = mount(elWrappedInContext(el, context));
  expect(dash.find('SelectTimeRange').length > 0).toEqual(true);
});
