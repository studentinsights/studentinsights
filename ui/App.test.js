import React from 'react';
import {mount} from 'enzyme';
import {NEW_BEDFORD} from '../app/assets/javascripts/helpers/PerDistrict';
import App from './App';
import HomePage from '../app/assets/javascripts/home/HomePage';
import EducatorPage from '../app/assets/javascripts/educator/EducatorPage';
import MyStudentsPage from '../app/assets/javascripts/my_students/MyStudentsPage';
import SchoolCoursesPage from '../app/assets/javascripts/school_courses/SchoolCoursesPage';
import SchoolAbsencesPage from '../app/assets/javascripts/school_absences/SchoolAbsencesPage';
import DashboardLoader from '../app/assets/javascripts/school_administrator_dashboard/DashboardLoader';
import DistrictEnrollmentPage from '../app/assets/javascripts/district_enrollment/DistrictEnrollmentPage';
import ClassListCreatorPage from '../app/assets/javascripts/class_lists/ClassListCreatorPage';
import ClassListsViewPage from '../app/assets/javascripts/class_lists/ClassListsViewPage';
import StudentProfilePageRoute from '../app/assets/javascripts/student_profile/StudentProfilePageRoute';
import {MemoryRouter} from 'react-router-dom';


jest.mock('../app/assets/javascripts/home/HomePage');
jest.mock('../app/assets/javascripts/educator/EducatorPage');
jest.mock('../app/assets/javascripts/my_students/MyStudentsPage');
jest.mock('../app/assets/javascripts/school_courses/SchoolCoursesPage');
jest.mock('../app/assets/javascripts/school_absences/SchoolAbsencesPage');
jest.mock('../app/assets/javascripts/school_administrator_dashboard/DashboardLoader');
jest.mock('../app/assets/javascripts/district_enrollment/DistrictEnrollmentPage');
jest.mock('../app/assets/javascripts/class_lists/ClassListCreatorPage');
jest.mock('../app/assets/javascripts/class_lists/ClassListsViewPage');
jest.mock('../app/assets/javascripts/student_profile/StudentProfilePageRoute');


function renderPath(path, options = {}) {
  const educator = options.educator || createSerializedDataEducator();
  const districtKey = options.districtKey || NEW_BEDFORD;
  return (
    <MemoryRouter initialEntries={[path]}>
      <App currentEducator={educator} districtKey={districtKey} />
    </MemoryRouter>
  );
}

// For testing, which mirrors the output of ui_controller#ui on the
// server.
function createSerializedDataEducator(props = {}) {
  return {
    id: 9999,
    admin: false,
    school_id: 99,
    labels: [],
    ...props
  };
}


it('renders HomePage without crashing', () => {
  const wrapper = mount(renderPath('/home'));
  expect(wrapper.contains(
    <HomePage educatorId={9999} educatorLabels={[]} />
  )).toEqual(true);
});

it('renders MyStudentsPage without crashing', () => {
  const wrapper = mount(renderPath('/educators/my_students'));
  expect(wrapper.contains(<MyStudentsPage />)).toEqual(true);
});

it('renders EducatorPage without crashing', () => {
  const wrapper = mount(renderPath('/educators/view/12'));
  expect(wrapper.contains(
    <EducatorPage educatorId={12} />
  )).toEqual(true);
});

it('render SchoolCoursesPage without crashing', () => {
  const wrapper = mount(renderPath('/schools/hea/courses'));
  expect(wrapper.contains(
    <SchoolCoursesPage schoolId="hea" />
  )).toEqual(true);
});

it('renders SchoolAbsencesPage without crashing', () => {
  const wrapper = mount(renderPath('/schools/hea/absences'));
  expect(wrapper.contains(
    <SchoolAbsencesPage schoolIdOrSlug="hea" />
  )).toEqual(true);
});

it('renders Tardies Dashboard without crashing', () => {
  const wrapper = mount(renderPath('/schools/hea/tardies'));
  expect(wrapper.contains(
    <DashboardLoader schoolId="hea" dashboardTarget="tardies"/>
  )).toEqual(true);
});

it('renders Discipline Dashboard without crashing', () => {
  const wrapper = mount(renderPath('/schools/hea/discipline'));
  expect(wrapper.contains(
    <DashboardLoader schoolId="hea" dashboardTarget="discipline"/>
  )).toEqual(true);
});

it('renders district enrollment', () => {
  const wrapper = mount(renderPath('/district/enrollment'));
  expect(wrapper.contains(
    <DistrictEnrollmentPage />
  )).toEqual(true);
});

it('renders new classlist', () => {
  const educator = createSerializedDataEducator();
  const wrapper = mount(renderPath('/classlists/new', {educator}));
  expect(wrapper.contains(
    <ClassListCreatorPage currentEducator={educator} />
  )).toEqual(true);
});

it('renders edit classlist', () => {
  const educator = createSerializedDataEducator();
  const wrapper = mount(renderPath('/classlists/foo-id', {educator}));
  expect(wrapper.contains(
    <ClassListCreatorPage currentEducator={educator} defaultWorkspaceId="foo-id" />
  )).toEqual(true);
});

it('renders list of classlists', () => {
  const wrapper = mount(renderPath('/classlists'));
  expect(wrapper.contains(
    <ClassListsViewPage currentEducatorId={9999} />
  )).toEqual(true);
});

it('renders student profile v3', () => {
  const wrapper = mount(renderPath('/students/42/v3?foo=bar'));
  expect(wrapper.contains(
    <StudentProfilePageRoute
      studentId={42}
      queryParams={{foo: 'bar'}}
      history={window.history}
    />
  )).toEqual(true);
});

describe('unknown route', () => {
  // This has to temporarily remove the Jest setup code
  // that fails the test when console.warn is triggered.
  var consoleWarn = null; // eslint-disable-line no-var
  beforeEach(() => {
    consoleWarn = console.warn; // eslint-disable-line no-console
    console.warn = jest.fn(); // eslint-disable-line no-console
  });

  afterEach(() => {
    console.warn = consoleWarn; // eslint-disable-line no-console
  });

  it('calls console.warn', () => {
    mount(renderPath('/fdsjfkdsjkflsdjfs'));
    expect(console.warn).toHaveBeenCalled(); // eslint-disable-line no-console
  });
});
