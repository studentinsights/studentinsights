import PropTypes from 'prop-types';
import React from 'react';
import {
  Switch,
  Route
} from 'react-router-dom';
import moment from 'moment';
import qs from 'query-string';
import MixpanelUtils from '../app/assets/javascripts/helpers/MixpanelUtils';
import NowContainer from '../app/assets/javascripts/testing/NowContainer';
import PerDistrictContainer from '../app/assets/javascripts/components/PerDistrictContainer';
import SessionRenewal from '../app/assets/javascripts/components/SessionRenewal';
import HomePage from '../app/assets/javascripts/home/HomePage';
import EducatorPage from '../app/assets/javascripts/educator/EducatorPage';
import HomeroomPage from '../app/assets/javascripts/homeroom/HomeroomPage';
import SchoolRosterPage from '../app/assets/javascripts/school_overview/SchoolRosterPage';
import SectionPage from '../app/assets/javascripts/section/SectionPage';
import TieringPage from '../app/assets/javascripts/tiering/TieringPage';
import DashboardLoader from '../app/assets/javascripts/school_administrator_dashboard/DashboardLoader';
import SchoolAbsencesPage from '../app/assets/javascripts/school_absences/SchoolAbsencesPage';
import SchoolCoursesPage from '../app/assets/javascripts/school_courses/SchoolCoursesPage';
import ExploreSchoolEquityPage from '../app/assets/javascripts/class_lists/ExploreSchoolEquityPage';
import ClassListCreatorPage from '../app/assets/javascripts/class_lists/ClassListCreatorPage';
import ClassListsViewPage from '../app/assets/javascripts/class_lists/ClassListsViewPage';
import ClassListsEquityPage from '../app/assets/javascripts/class_lists/ClassListsEquityPage';
import DistrictEnrollmentPage from '../app/assets/javascripts/district_enrollment/DistrictEnrollmentPage';
import ImportRecordsPage from '../app/assets/javascripts/import_records/ImportRecordsPage';
import StudentVoiceSurveyUploadsPage from '../app/assets/javascripts/student_voice_survey_uploads/StudentVoiceSurveyUploadsPage';
import SampleStudentsPage from '../app/assets/javascripts/sample_students/SampleStudentsPage';
import MyStudentsPage from '../app/assets/javascripts/my_students/MyStudentsPage';
import MySectionsPage from '../app/assets/javascripts/my_sections/MySectionsPage';
import StudentProfilePageRoute from '../app/assets/javascripts/student_profile/StudentProfilePageRoute';
import IsServiceWorking from '../app/assets/javascripts/service_types/IsServiceWorking';
import LoginActivityPageContainer from '../app/assets/javascripts/login_activity/LoginActivityPageContainer';

// This is the top-level component, only handling routing.
// The core model is still "new page, new load," this just
// handles routing on initial page load for JS code.
export default class App extends React.Component {
  // Read which educator Rails wrote inline in the HTML page,
  // and report routing activity for analytics (eg, MixPanel)
  // TODO(kr) could do this as a higher-order component
  // to remove having to do this manually for each route.
  trackVisit(routeProps, pageKey, params = {}) {
    const {currentEducator} = this.props;
    MixpanelUtils.registerUser(currentEducator);
    MixpanelUtils.track('PAGE_VISIT', {...params, page_key: pageKey });
  }

  // `NowContainer` provides a fn to read the time
  // in any deeply nested component,
  // `PerDistrictContainer` provides `districtKey`.
  render() {
    const {districtKey, sessionTimeoutInSeconds} = this.props;
    return (
      <NowContainer nowFn={() => moment.utc()}>
        <PerDistrictContainer districtKey={districtKey}>
          <div className="App-content" style={styles.flexVertical}>
            {sessionTimeoutInSeconds && this.renderSessionRenewal(sessionTimeoutInSeconds)}
            {this.renderRoutes()}
          </div>
        </PerDistrictContainer>
      </NowContainer>
    );
  }

  // `SessionRenewal` cues the user when their session is about to timeout from inactivity.
  renderSessionRenewal(sessionTimeoutInSeconds) {
    return (
      <SessionRenewal
        sessionTimeoutInSeconds={sessionTimeoutInSeconds}
        warningTimeoutInSeconds={sessionTimeoutInSeconds - 1} />
    );
  }

  // Expects serializedData and navbar, see `ui#ui` on the server
  // side.
  renderRoutes() {
    return (
      <Switch className="App-routes">
        <Route exact path="/admin/import_records" render={this.renderImportRecordsPage.bind(this)}/>
        <Route exact path="/admin/sample_students" render={this.renderSampleStudentsPage.bind(this)}/>
        <Route exact path="/admin/student_voice_survey_uploads" render={this.renderStudentVoiceSurveyUploadsPage.bind(this)}/>
        <Route exact path="/schools/:id/courses" render={this.renderSchoolCoursesPage.bind(this)}/>
        <Route exact path="/educators/view/:id" render={this.renderEducatorPage.bind(this)}/>
        <Route exact path="/educators/my_students" render={this.renderMyStudentsPage.bind(this)}/>
        <Route exact path="/educators/my_sections" render={this.renderMySectionsPage.bind(this)}/>
        <Route exact path="/home" render={this.renderHomePage.bind(this)}/>
        <Route exact path="/schools/:id_or_slug" render={this.renderSchoolRosterPage.bind(this)}/>
        <Route exact path="/schools/:id_or_slug/absences" render={this.renderAbsencesPage.bind(this)}/>
        <Route exact path="/schools/:id_or_slug/absences/v2" render={this.renderAbsencesPageV2.bind(this)}/>
        <Route exact path="/schools/:id/tardies" render={this.renderTardiesDashboard.bind(this)}/>
        <Route exact path="/schools/:id/discipline" render={this.renderDisciplineDashboard.bind(this)}/>
        <Route exact path="/schools/:id/equity/explore" render={this.renderExploreSchoolEquityPage.bind(this)}/>
        <Route exact path="/homerooms/:id_or_slug" render={this.renderHomeroomPage.bind(this)}/>
        <Route exact path="/sections/:id" render={this.renderSectionPage.bind(this)}/>
        <Route exact path="/students/:id/v3" render={this.renderStudentProfilePage.bind(this)}/>
        <Route exact path="/classlists" render={this.renderClassListsViewPage.bind(this)}/>
        <Route exact path="/classlists/equity" render={this.renderExperimentalClassListsEquityPage.bind(this)}/>
        <Route exact path="/classlists/new" render={this.renderClassListCreatorNew.bind(this)}/>
        <Route exact path="/classlists/:workspace_id" render={this.renderClassListCreatorEdit.bind(this)}/>
        <Route exact path="/district/enrollment" render={this.renderDistrictEnrollmentPage.bind(this)}/>
        <Route exact path="/levels/:school_id" render={this.renderTieringPage.bind(this)}/>
        <Route exact path="/is_service_working" render={this.renderIsServiceWorking.bind(this)}/>
        <Route exact path='/login_activity' render={this.renderLoginActivity.bind(this)}/>
        <Route render={() => this.renderNotFound()} />
      </Switch>
    );
  }

  renderHomePage(routeProps) {
    const {currentEducator} = this.props;
    const {id, labels} = currentEducator;
    this.trackVisit(routeProps, 'HOME_PAGE');
    return <HomePage
      educatorId={id}
      educatorLabels={labels} />;
  }

  renderMyStudentsPage(routeProps) {
    this.trackVisit(routeProps, 'MY_STUDENTS_PAGE');
    return <MyStudentsPage />;
  }

  renderMySectionsPage(routeProps) {
    const {currentEducator} = this.props;
    this.trackVisit(routeProps, 'MY_SECTIONS_PAGE');
    return <MySectionsPage currentEducatorId={currentEducator.id} />;
  }

  renderStudentProfilePage(routeProps) {
    const studentId = parseInt(routeProps.match.params.id, 10);
    this.trackVisit(routeProps, 'STUDENT_PROFILE_V3', {
      student_id: studentId
    });
    const queryParams = qs.parse(routeProps.location.search.slice(1));
    return (
      <StudentProfilePageRoute
        studentId={studentId}
        queryParams={queryParams}
        history={window.history} />
    );
  }

  renderExploreSchoolEquityPage(routeProps) {
    const schoolId = routeProps.match.params.id;
    this.trackVisit(routeProps, 'EXPLORE_SCHOOL_EQUITY_PAGE');
    return <ExploreSchoolEquityPage schoolId={schoolId} />;
  }

  renderClassListsViewPage(routeProps) {
    const {currentEducator} = this.props;
    this.trackVisit(routeProps, 'CLASSROOM_LISTS_VIEW_PAGE');
    return <ClassListsViewPage currentEducatorId={currentEducator.id} />;
  }

  renderExperimentalClassListsEquityPage(routeProps) {
    this.trackVisit(routeProps, 'CLASSROOM_LISTS_EQUITY_PAGE');
    return <ClassListsEquityPage />;
  }

  renderClassListCreatorEdit(routeProps) {
    const {currentEducator} = this.props;
    const workspaceId = routeProps.match.params.workspace_id;
    this.trackVisit(routeProps, 'CLASSROOM_LIST_CREATOR_PAGE');
    return <ClassListCreatorPage currentEducator={currentEducator} defaultWorkspaceId={workspaceId} />;
  }
  renderClassListCreatorNew(routeProps) {
    const {currentEducator} = this.props;
    this.trackVisit(routeProps, 'CLASSROOM_LIST_CREATOR_PAGE');
    return <ClassListCreatorPage currentEducator={currentEducator} />;
  }

  renderHomeroomPage(routeProps) {
    const homeroomIdOrSlug = routeProps.match.params.id_or_slug;
    this.trackVisit(routeProps, 'ROSTER_PAGE', {
      homeroom_id_or_slug: homeroomIdOrSlug
    });
    return <HomeroomPage homeroomIdOrSlug={homeroomIdOrSlug} />;
  }

  renderSectionPage(routeProps) {
    const sectionId = parseInt(routeProps.match.params.id, 10);
    this.trackVisit(routeProps, 'SECTION', {
      section_id: sectionId
    });
    return <SectionPage sectionId={sectionId} />;
  }

  renderSchoolCoursesPage(routeProps) {
    const schoolId = routeProps.match.params.id;
    this.trackVisit(routeProps, 'SCHOOL_COURSES_PAGE');
    return <SchoolCoursesPage schoolId={schoolId} />;
  }

  renderEducatorPage(routeProps) {
    const educatorId = parseInt(routeProps.match.params.id, 10);
    this.trackVisit(routeProps, 'EDUCATOR_PAGE');
    return <EducatorPage educatorId={educatorId} />;
  }

  renderImportRecordsPage(routeProps) {
    this.trackVisit(routeProps, 'IMPORT_RECORDS_PAGE');
    return <ImportRecordsPage />;
  }

  renderSampleStudentsPage(routeProps) {
    const queryParams = qs.parse(routeProps.location.search.slice(1));
    const n = parseInt(queryParams.n || '50', 10);
    const seed = parseInt(queryParams.seed || '42', 10);
    this.trackVisit(routeProps, 'SAMPLE_STUDENTS_PAGE');
    return <SampleStudentsPage n={n} seed={seed} />; 
  }

  renderStudentVoiceSurveyUploadsPage(routeProps) {
    const {currentEducator} = this.props;
    this.trackVisit(routeProps, 'STUDENT_VOICE_SURVEY_UPLOADS_AGE');
    return <StudentVoiceSurveyUploadsPage currentEducatorId={currentEducator.id} />;
  }

  renderSchoolRosterPage(routeProps) {
    const schoolIdOrSlug = routeProps.match.params.id_or_slug;
    this.trackVisit(routeProps, 'SCHOOL_OVERVIEW_DASHBOARD', { school_id_or_slug: schoolIdOrSlug});
    return <SchoolRosterPage schoolIdOrSlug={schoolIdOrSlug} />;
  }

  renderAbsencesPageV2(routeProps) {
    const schoolIdOrSlug = routeProps.match.params.id_or_slug;
    this.trackVisit(routeProps, 'ABSENCES_DASHBOARD', { school_id_or_slug: schoolIdOrSlug});
    return <SchoolAbsencesPage schoolIdOrSlug={schoolIdOrSlug} />;
  }

  // deprecated
  renderAbsencesPage(routeProps) {
    const schoolId = routeProps.match.params.id;
    this.trackVisit(routeProps, 'ABSENCES_DASHBOARD', { school_id: schoolId});
    return <DashboardLoader schoolId={schoolId} dashboardTarget={'absences'} />;
  }

  renderTardiesDashboard(routeProps) {
    const schoolId = routeProps.match.params.id;
    this.trackVisit(routeProps, 'TARDIES_DASHBOARD', { school_id: schoolId});
    return <DashboardLoader schoolId={schoolId} dashboardTarget={'tardies'}/>;
  }

  renderDisciplineDashboard(routeProps) {
    const schoolId = routeProps.match.params.id;
    this.trackVisit(routeProps, 'DISCIPLINE_DASHBOARD', { school_id: schoolId});
    return <DashboardLoader schoolId={schoolId} dashboardTarget={'discipline'}/>;
  }

  renderDistrictEnrollmentPage(routeProps) {
    this.trackVisit(routeProps, 'DISTRICT_ENROLLMENT_PAGE');
    return <DistrictEnrollmentPage />;
  }

  renderTieringPage(routeProps) {
    const schoolId = routeProps.match.params.school_id;
    this.trackVisit(routeProps, 'TIERING_PAGE');
    return <TieringPage schoolId={schoolId} />;
  }

  renderIsServiceWorking(routeProps) {
    return <IsServiceWorking />;
  }

  renderLoginActivity(routeProps) {
    return <LoginActivityPageContainer />;
  }

  // Ignore this, since we're hybrid client/server and perhaps the
  // server has rendered something and the client-side app just doesn't
  // know about it.
  renderNotFound() {
    console.warn('App: 404'); // eslint-disable-line no-console
    return null;
  }
}
App.propTypes = {
  districtKey: PropTypes.string.isRequired,
  currentEducator: PropTypes.shape({
    id: PropTypes.number.isRequired,
    admin: PropTypes.bool.isRequired,
    school_id: PropTypes.number,
    labels: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  sessionTimeoutInSeconds: PropTypes.number
};

const styles = {
  flexVertical: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  }
};
