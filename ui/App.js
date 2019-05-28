import PropTypes from 'prop-types';
import React from 'react';
import {
  Switch,
  Route
} from 'react-router-dom';
import _ from 'lodash';
import moment from 'moment';
import qs from 'query-string';
import NowContainer from '../app/assets/javascripts/testing/NowContainer';
import PerDistrictContainer from '../app/assets/javascripts/components/PerDistrictContainer';
import SessionRenewal from '../app/assets/javascripts/components/SessionRenewal';
import RollbarErrorBoundary from '../app/assets/javascripts/components/RollbarErrorBoundary';
import HomePage from '../app/assets/javascripts/home/HomePage';
import SearchNotesPage from '../app/assets/javascripts/search_notes/SearchNotesPage';
import EducatorPage from '../app/assets/javascripts/educator/EducatorPage';
import HomeroomPage from '../app/assets/javascripts/homeroom/HomeroomPage';
import SchoolRosterPage from '../app/assets/javascripts/school_overview/SchoolRosterPage';
import SectionPage from '../app/assets/javascripts/section/SectionPage';
import LevelsPage from '../app/assets/javascripts/levels/LevelsPage';
import DashboardLoader from '../app/assets/javascripts/school_administrator_dashboard/DashboardLoader';
import SchoolAbsencesPage from '../app/assets/javascripts/school_absences/SchoolAbsencesPage';
import SchoolCoursesPage from '../app/assets/javascripts/school_courses/SchoolCoursesPage';
import ClassListCreatorPage from '../app/assets/javascripts/class_lists/ClassListCreatorPage';
import ClassListsViewPage from '../app/assets/javascripts/class_lists/ClassListsViewPage';
import DistrictOverviewPage from '../app/assets/javascripts/district_overview/DistrictOverviewPage';
import DistrictEnrollmentPage from '../app/assets/javascripts/district_enrollment/DistrictEnrollmentPage';
import ImportRecordsPage from '../app/assets/javascripts/import_records/ImportRecordsPage';
import StudentVoiceSurveyUploadsPage from '../app/assets/javascripts/student_voice_survey_uploads/StudentVoiceSurveyUploadsPage';
import SampleStudentsPage from '../app/assets/javascripts/sample_students/SampleStudentsPage';
import MyNotesPage from '../app/assets/javascripts/my_notes/MyNotesPage';
import ReadingEntryPage from '../app/assets/javascripts/reading/ReadingEntryPage';
import ReadingGroupingPage from '../app/assets/javascripts/reading/ReadingGroupingPage';
import ReadingDebugPage from '../app/assets/javascripts/reading_debug/ReadingDebugPage';
import ReadingDebugStarPage from '../app/assets/javascripts/reading_debug/ReadingDebugStarPage';
import MyStudentsPage from '../app/assets/javascripts/my_students/MyStudentsPage';
import CounselorMeetingsPage from '../app/assets/javascripts/counselor_meetings/CounselorMeetingsPage';
import TransitionsPage from '../app/assets/javascripts/transitions/TransitionsPage';
import MySectionsPage from '../app/assets/javascripts/my_sections/MySectionsPage';
import StudentProfilePage from '../app/assets/javascripts/student_profile/StudentProfilePage';
import IsServiceWorking from '../app/assets/javascripts/service_types/IsServiceWorking';
import LoginActivityPageContainer from '../app/assets/javascripts/login_activity/LoginActivityPageContainer';
import ServiceUploadsPage from '../app/assets/javascripts/service_uploads/ServiceUploadsPage';
import EquityStatsBySchoolPage  from '../app/assets/javascripts/equity/EquityStatsBySchoolPage';
import ExploreSchoolEquityPage from '../app/assets/javascripts/equity/ExploreSchoolEquityPage';
import QuiltsPage from '../app/assets/javascripts/equity/QuiltsPage';
import ClassListsEquityIndexPage from '../app/assets/javascripts/equity/ClassListsEquityIndexPage';

// This is the top-level component, only handling routing.
// The core model is still "new page, new load," this just
// handles routing on initial page load for JS code.
export default class App extends React.Component {
  rollbarErrorFn(msg, obj = {}) {
    this.props.rollbarErrorFn(msg, obj);
  }

  // `NowContainer` provides a fn to read the time
  // in any deeply nested component,
  // `PerDistrictContainer` provides `districtKey`.
  render() {
    const {districtKey, rollbarErrorFn, sessionTimeoutInSeconds} = this.props;
    return (
      <RollbarErrorBoundary rollbarErrorFn={rollbarErrorFn}>
        <NowContainer nowFn={() => moment.utc()}>
          <PerDistrictContainer districtKey={districtKey}>
            <div className="App-content" style={styles.flexVertical}>
              {sessionTimeoutInSeconds && this.renderSessionRenewal(sessionTimeoutInSeconds)}
              {this.renderRoutes()}
            </div>
          </PerDistrictContainer>
        </NowContainer>
      </RollbarErrorBoundary>
    );
  }

  // `SessionRenewal` cues the user when their session is about to timeout from inactivity.
  renderSessionRenewal(sessionTimeoutInSeconds) {
    return (
      <SessionRenewal
        probeIntervalInSeconds={60}
        warningDurationInSeconds={30} />
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
        <Route exact path="/educators/my_notes" render={this.renderMyNotesPage.bind(this)}/>
        <Route exact path="/educators/my_students" render={this.renderMyStudentsPage.bind(this)}/>
        <Route exact path="/counselors/meetings" render={this.renderCounselorMeetingsPage.bind(this)}/>
        <Route exact path="/counselors/transitions" render={this.renderTransitionsPage.bind(this)}/>
        <Route exact path="/educators/my_sections" render={this.renderMySectionsPage.bind(this)}/>
        <Route exact path="/home" render={this.renderHomePage.bind(this)}/>
        <Route exact path="/search/notes" render={this.renderSearchNotesPage.bind(this)}/>
        <Route exact path="/schools/:id_or_slug" render={this.renderSchoolRosterPage.bind(this)}/>
        <Route exact path="/schools/:id_or_slug/absences" render={this.renderAbsencesPage.bind(this)}/>
        <Route exact path="/schools/:id/tardies" render={this.renderTardiesDashboard.bind(this)}/>
        <Route exact path="/schools/:id/discipline" render={this.renderDisciplineDashboard.bind(this)}/>
        <Route exact path="/schools/:slug/reading/:grade/entry" render={this.renderReadingEntryPage.bind(this)}/>
        <Route exact path="/schools/:slug/reading/:grade/groups" render={this.renderReadingGroupingPage.bind(this)}/>
        <Route exact path="/reading/debug" render={this.renderReadingDebugPage.bind(this)}/>
        <Route exact path="/reading/debug_star" render={this.renderReadingDebugStarPage.bind(this)}/>
        <Route exact path="/homerooms/:id_or_slug" render={this.renderHomeroomPage.bind(this)}/>
        <Route exact path="/sections/:id" render={this.renderSectionPage.bind(this)}/>
        <Route exact path="/students/:id" render={this.renderStudentProfilePage.bind(this)}/>
        <Route exact path="/students/:id/v3" render={this.renderStudentProfilePage.bind(this)}/>
        <Route exact path="/students/:id/v4" render={this.renderStudentProfilePage.bind(this)}/>
        <Route exact path="/classlists" render={this.renderClassListsViewPage.bind(this)}/>
        <Route exact path="/classlists/new" render={this.renderClassListCreatorNew.bind(this)}/>
        <Route exact path="/classlists/:workspace_id" render={this.renderClassListCreatorEdit.bind(this)}/>
        <Route exact path="/equity/schools/:id/explore" render={this.renderExploreSchoolEquityPage.bind(this)}/>
        <Route exact path="/equity/schools/:id/quilts" render={this.renderQuiltsSchoolEquityPage.bind(this)}/>
        <Route exact path="/equity/classlists_index" render={this.renderClassListsEquityIndexPage.bind(this)}/>
        <Route exact path="/equity/stats_by_school" render={this.renderEquityStatsBySchoolPage.bind(this)}/>
        <Route exact path="/district/enrollment" render={this.renderDistrictEnrollmentPage.bind(this)}/>
        <Route exact path="/district" render={this.renderDistrictOverviewPage.bind(this)}/>
        <Route exact path="/levels/:school_id" render={this.renderLevelsPage.bind(this)}/>
        <Route exact path="/is_service_working" render={this.renderIsServiceWorking.bind(this)}/>
        <Route exact path='/login_activity' render={this.renderLoginActivity.bind(this)}/>
        <Route exact path='/service_uploads' render={this.renderServiceUploads.bind(this)}/>
        <Route render={() => this.renderNotFound()} />
      </Switch>
    );
  }

  renderHomePage(routeProps) {
    const {currentEducator} = this.props;
    const {id, labels} = currentEducator;
    return <HomePage
      educatorId={id}
      educatorLabels={labels} />;
  }

  renderSearchNotesPage(routeProps) {
    const {currentEducator} = this.props;
    const {id, labels} = currentEducator;
    return (
      <SearchNotesPage
        educatorId={id}
        educatorLabels={labels} />
    );
  }

  renderMyNotesPage(routeProps) {
    return <MyNotesPage />;
  }

  renderMyStudentsPage(routeProps) {
    return <MyStudentsPage />;
  }

  renderCounselorMeetingsPage(routeProps) {
    const {currentEducator} = this.props;
    return <CounselorMeetingsPage currentEducatorId={currentEducator.id} />;
  }

  renderTransitionsPage(routeProps) {
    return <TransitionsPage />; 
  }

  renderMySectionsPage(routeProps) {
    const {currentEducator} = this.props;
    return <MySectionsPage currentEducatorId={currentEducator.id} />;
  }

  renderStudentProfilePage(routeProps) {
    const studentId = parseInt(routeProps.match.params.id, 10);
    const queryParams = qs.parse(routeProps.location.search.slice(1));
    return (
      <StudentProfilePage
        studentId={studentId}
        queryParams={queryParams}
        history={window.history} />
    );
  }

  renderReadingDebugPage(routeProps) {
    return <ReadingDebugPage />;
  }

  renderReadingDebugStarPage(routeProps) {
    return <ReadingDebugStarPage />;
  }

  renderReadingEntryPage(routeProps) {
    const {currentEducator} = this.props;
    const schoolSlug = routeProps.match.params.slug;
    const grade = routeProps.match.params.grade;
    return (
      <ReadingEntryPage
        currentEducatorId={currentEducator.id}
        schoolSlug={schoolSlug}
        grade={grade}
      />
    );
  }

  renderReadingGroupingPage(routeProps) {
    const schoolSlug = routeProps.match.params.slug;
    const grade = routeProps.match.params.grade;
    return <ReadingGroupingPage schoolSlug={schoolSlug} grade={grade} />;
  }

  renderExploreSchoolEquityPage(routeProps) {
    const schoolId = routeProps.match.params.id;
    return <ExploreSchoolEquityPage schoolId={schoolId} />;
  }

  renderQuiltsSchoolEquityPage(routeProps) {
    const schoolId = routeProps.match.params.id;
    return <QuiltsPage schoolId={schoolId} />;
  }

  renderClassListsViewPage(routeProps) {
    const {currentEducator} = this.props;
    const queryParams = qs.parse(routeProps.location.search.slice(1));
    return (
      <ClassListsViewPage
        useTextLinks={_.has(queryParams, 'text')}
        includeHistorical={_.has(queryParams, 'historical')}
        currentEducatorId={currentEducator.id}
      />
    );
  }

  renderClassListsEquityIndexPage(routeProps) {
    return <ClassListsEquityIndexPage />;
  }

  renderEquityStatsBySchoolPage(routeProps) {
    return <EquityStatsBySchoolPage />;
  }

  renderClassListCreatorEdit(routeProps) {
    const {currentEducator} = this.props;
    const workspaceId = routeProps.match.params.workspace_id;
    return <ClassListCreatorPage currentEducator={currentEducator} defaultWorkspaceId={workspaceId} />;
  }
  renderClassListCreatorNew(routeProps) {
    const {currentEducator} = this.props;
    return <ClassListCreatorPage currentEducator={currentEducator} />;
  }

  renderHomeroomPage(routeProps) {
    const homeroomIdOrSlug = routeProps.match.params.id_or_slug;
    return <HomeroomPage homeroomIdOrSlug={homeroomIdOrSlug} />;
  }

  renderSectionPage(routeProps) {
    const sectionId = parseInt(routeProps.match.params.id, 10);
    return <SectionPage sectionId={sectionId} />;
  }

  renderSchoolCoursesPage(routeProps) {
    const schoolId = routeProps.match.params.id;
    return <SchoolCoursesPage schoolId={schoolId} />;
  }

  renderEducatorPage(routeProps) {
    const educatorId = parseInt(routeProps.match.params.id, 10);
    return <EducatorPage educatorId={educatorId} />;
  }

  renderImportRecordsPage(routeProps) {
    return <ImportRecordsPage />;
  }

  renderSampleStudentsPage(routeProps) {
    const queryParams = qs.parse(routeProps.location.search.slice(1));
    const n = parseInt(queryParams.n || '50', 10);
    const seed = parseInt(queryParams.seed || '42', 10);
    return <SampleStudentsPage n={n} seed={seed} />; 
  }

  renderStudentVoiceSurveyUploadsPage(routeProps) {
    const {currentEducator} = this.props;
    return <StudentVoiceSurveyUploadsPage currentEducatorId={currentEducator.id} />;
  }

  renderSchoolRosterPage(routeProps) {
    const schoolIdOrSlug = routeProps.match.params.id_or_slug;
    return <SchoolRosterPage schoolIdOrSlug={schoolIdOrSlug} />;
  }

  renderAbsencesPage(routeProps) {
    const schoolIdOrSlug = routeProps.match.params.id_or_slug;
    return <SchoolAbsencesPage schoolIdOrSlug={schoolIdOrSlug} />;
  }

  renderTardiesDashboard(routeProps) {
    const schoolId = routeProps.match.params.id;
    return <DashboardLoader schoolId={schoolId} dashboardTarget={'tardies'}/>;
  }

  renderDisciplineDashboard(routeProps) {
    const schoolId = routeProps.match.params.id;
    return <DashboardLoader schoolId={schoolId} dashboardTarget={'discipline'}/>;
  }

  renderDistrictEnrollmentPage(routeProps) {
    return <DistrictEnrollmentPage />;
  }

  renderDistrictOverviewPage(routeProps) {
    return <DistrictOverviewPage />;
  }

  renderLevelsPage(routeProps) {
    const schoolId = routeProps.match.params.school_id;
    return <LevelsPage schoolId={schoolId} />;
  }

  renderIsServiceWorking(routeProps) {
    return <IsServiceWorking />;
  }

  renderLoginActivity(routeProps) {
    return <LoginActivityPageContainer />;
  }

  renderServiceUploads(routeProps) {
    return <ServiceUploadsPage />;
  }

  // Ignore this, since we're hybrid client/server and perhaps the
  // server has rendered something and the client-side app just doesn't
  // know about it.
  renderNotFound() {
    this.rollbarErrorFn('App#renderNotFound');
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
  rollbarErrorFn: PropTypes.func.isRequired,
  sessionTimeoutInSeconds: PropTypes.number
};

const styles = {
  flexVertical: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  }
};
