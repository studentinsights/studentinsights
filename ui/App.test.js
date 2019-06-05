import React from 'react';
import {mount} from 'enzyme';
import {NEW_BEDFORD} from '../app/assets/javascripts/helpers/PerDistrict';
import App from './App';
import HomePage from '../app/assets/javascripts/home/HomePage';
import SearchNotesPage from '../app/assets/javascripts/search_notes/SearchNotesPage';
import EducatorPage from '../app/assets/javascripts/educator/EducatorPage';
import MyStudentsPage from '../app/assets/javascripts/my_students/MyStudentsPage';
import MyNotesPage from '../app/assets/javascripts/my_notes/MyNotesPage';
import SchoolCoursesPage from '../app/assets/javascripts/school_courses/SchoolCoursesPage';
import SchoolAbsencesPage from '../app/assets/javascripts/school_absences/SchoolAbsencesPage';
import ReadingEntryPage from '../app/assets/javascripts/reading/ReadingEntryPage';
import ReadingGroupingPage from '../app/assets/javascripts/reading/ReadingGroupingPage';
import DashboardLoader from '../app/assets/javascripts/school_administrator_dashboard/DashboardLoader';
import DistrictEnrollmentPage from '../app/assets/javascripts/district_enrollment/DistrictEnrollmentPage';
import ClassListCreatorPage from '../app/assets/javascripts/class_lists/ClassListCreatorPage';
import ClassListsViewPage from '../app/assets/javascripts/class_lists/ClassListsViewPage';
import StudentProfilePage from '../app/assets/javascripts/student_profile/StudentProfilePage';
import CounselorMeetingsPage from '../app/assets/javascripts/counselor_meetings/CounselorMeetingsPage';
import TransitionsPage from '../app/assets/javascripts/transitions/TransitionsPage';
import {MemoryRouter} from 'react-router-dom';


jest.mock('../app/assets/javascripts/home/HomePage');
jest.mock('../app/assets/javascripts/search_notes/SearchNotesPage');
jest.mock('../app/assets/javascripts/educator/EducatorPage');
jest.mock('../app/assets/javascripts/my_students/MyStudentsPage');
jest.mock('../app/assets/javascripts/my_notes/MyNotesPage');
jest.mock('../app/assets/javascripts/school_courses/SchoolCoursesPage');
jest.mock('../app/assets/javascripts/school_absences/SchoolAbsencesPage');
jest.mock('../app/assets/javascripts/reading/ReadingEntryPage');
jest.mock('../app/assets/javascripts/reading/ReadingGroupingPage');
jest.mock('../app/assets/javascripts/school_administrator_dashboard/DashboardLoader');
jest.mock('../app/assets/javascripts/district_enrollment/DistrictEnrollmentPage');
jest.mock('../app/assets/javascripts/class_lists/ClassListCreatorPage');
jest.mock('../app/assets/javascripts/class_lists/ClassListsViewPage');
jest.mock('../app/assets/javascripts/student_profile/StudentProfilePage');
jest.mock('../app/assets/javascripts/counselor_meetings/CounselorMeetingsPage');
jest.mock('../app/assets/javascripts/transitions/TransitionsPage');



function renderPath(path, options = {}) {
  const educator = options.educator || createSerializedDataEducator();
  const districtKey = options.districtKey || NEW_BEDFORD;
  return (
    <MemoryRouter initialEntries={[path]}>
      <App
        currentEducator={educator}
        districtKey={districtKey}
        rollbarErrorFn={jest.fn()}
      />
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

it('renders SearchNotesPage without crashing', () => {
  const wrapper = mount(renderPath('/search/notes'));
  expect(wrapper.contains(
    <SearchNotesPage educatorId={9999} educatorLabels={[]} />
  )).toEqual(true);
});


it('renders MyStudentsPage without crashing', () => {
  const wrapper = mount(renderPath('/educators/my_students'));
  expect(wrapper.contains(<MyStudentsPage />)).toEqual(true);
});

it('renders MyNotesPage without crashing', () => {
  const wrapper = mount(renderPath('/educators/my_notes'));
  expect(wrapper.contains(<MyNotesPage />)).toEqual(true);
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

it('render ReadingEntryPage without crashing', () => {
  const wrapper = mount(renderPath('/schools/hea/reading/3/entry'));
  expect(wrapper.contains(
    <ReadingEntryPage
      currentEducatorId={9999}
      schoolSlug="hea"
      grade="3" />
  )).toEqual(true);
});

it('render ReadingGroupingPage without crashing', () => {
  const wrapper = mount(renderPath('/schools/hea/reading/3/groups'));
  expect(wrapper.contains(
    <ReadingGroupingPage
      schoolSlug="hea"
      grade="3" />
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
    <ClassListsViewPage
      currentEducatorId={9999}
      useTextLinks={false}
      includeHistorical={false}
    />
  )).toEqual(true);
});

it('renders list of classlists, respecting query', () => {
  const wrapper = mount(renderPath('/classlists?text&historical'));
  expect(wrapper.contains(
    <ClassListsViewPage
      currentEducatorId={9999}
      useTextLinks={true}
      includeHistorical={true}
    />
  )).toEqual(true);
});

it('renders student profile', () => {
  const wrapper = mount(renderPath('/students/42?foo=bar'));
  expect(wrapper.contains(
    <StudentProfilePage
      studentId={42}
      queryParams={{foo: 'bar'}}
      history={window.history}
    />
  )).toEqual(true);
});

it('renders student profile v4', () => {
  const wrapper = mount(renderPath('/students/42/v4?foo=bar'));
  expect(wrapper.contains(
    <StudentProfilePage
      studentId={42}
      queryParams={{foo: 'bar'}}
      history={window.history}
    />
  )).toEqual(true);
});

it('renders counselor meetings page', () => {
  const wrapper = mount(renderPath('/counselors/meetings'));
  expect(wrapper.contains(
    <CounselorMeetingsPage currentEducatorId={9999} />
  )).toEqual(true);
});

it('renders counselor meetings page', () => {
  const educator = createSerializedDataEducator();
  const wrapper = mount(renderPath('/counselors/transitions', {educator}));
  expect(wrapper.contains(<TransitionsPage />)).toEqual(true);
});


describe('unknown route', () => {
  it('reports to Rollbar', () => {
    const wrapper = mount(renderPath('/fdsjfkdsjkflsdjfs'));
    const appProps = wrapper.find(App).props();
    expect(appProps.rollbarErrorFn).toHaveBeenCalled();
  });
});
