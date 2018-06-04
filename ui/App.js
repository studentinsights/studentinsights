import PropTypes from 'prop-types';
import React from 'react';
import {
  Switch,
  Route
} from 'react-router-dom';
import MixpanelUtils from '../app/assets/javascripts/helpers/mixpanel_utils.jsx';
import HomePage from '../app/assets/javascripts/home/HomePage';
import EducatorPage from '../app/assets/javascripts/educator/EducatorPage';
import DashboardLoader from '../app/assets/javascripts/school_administrator_dashboard/dashboard_components/DashboardLoader';
import SchoolCoursesPage from '../app/assets/javascripts/school_courses/SchoolCoursesPage';
import MountTimer from '../app/assets/javascripts/components/MountTimer';
import measurePageLoad from '../app/assets/javascripts/helpers/measurePageLoad';
import ExploreSchoolEquityPage from '../app/assets/javascripts/class_lists/ExploreSchoolEquityPage';
import ClassListCreatorPage from '../app/assets/javascripts/class_lists/ClassListCreatorPage';
import ClassListsViewPage from '../app/assets/javascripts/class_lists/ClassListsViewPage';
import DistrictEnrollmentPage from '../app/assets/javascripts/district_enrollment/DistrictEnrollmentPage';
import ImportRecordsPage from '../app/assets/javascripts/import_records/ImportRecordsPage';

// This is the top-level component, only handling routing.
// The core model is still "new page, new load," this just
// handles routing on initial page load for JS code.
class App extends React.Component {
  // This is mostly for testing, and provides a fn to read the time
  // in any deeply nested component.
  // Note that `context` should be avoided in general, and that the API
  // is changing in upcoming React releases: https://reactjs.org/docs/context.html
  getChildContext() {
    return {
      nowFn() { return moment.utc(); }
    };
  }

  componentDidMount() {
    measurePageLoad(info => console.log(JSON.stringify(info, null, 2))); // eslint-disable-line no-console
  }

  // Read which educator Rails wrote inline in the HTML page,
  // and report routing activity for analytics (eg, MixPanel)
  // TODO(kr) could do this as a higher-order component
  // to remove having to do this manually for each route.
  trackVisit(routeProps, pageKey) {
    const {currentEducator} = this.props;
    MixpanelUtils.registerUser(currentEducator);
    MixpanelUtils.track('PAGE_VISIT', { page_key: pageKey });
  }

  // Expects serializedData and navbar, see `ui#ui` on the server
  // side.
  render() {
    return (
      <MountTimer>
        <Switch>
          <Route exact path="/admin/import_records" render={this.renderImportRecordsPage.bind(this)}/>
          <Route exact path="/schools/:id/courses" render={this.renderSchoolCoursesPage.bind(this)}/>
          <Route exact path="/educators/view/:id" render={this.renderEducatorPage.bind(this)}/>
          <Route exact path="/home" render={this.renderHomePage.bind(this)}/>
          <Route exact path="/schools/:id/absences" render={this.renderAbsencesDashboard.bind(this)}/>
          <Route exact path="/schools/:id/tardies" render={this.renderTardiesDashboard.bind(this)}/>
          <Route exact path="/schools/:id/discipline" render={this.renderDisciplineDashboard.bind(this)}/>
          <Route exact path="/schools/:id/equity/explore" render={this.renderExploreSchoolEquityPage.bind(this)}/>
          <Route exact path="/classlists" render={this.renderClassListsViewPage.bind(this)}/>
          <Route exact path="/classlists/new" render={this.renderClassListCreatorNew.bind(this)}/>
          <Route exact path="/classlists/:workspace_id" render={this.renderClassListCreatorEdit.bind(this)}/>
          <Route exact path="/district/enrollment" render={this.renderDistrictEnrollmentPage.bind(this)}/>
          <Route render={() => this.renderNotFound()} />
        </Switch>
      </MountTimer>
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

  renderAbsencesDashboard(routeProps) {
    return <DashboardLoader schoolId={routeProps.match.params.id} dashboardTarget={'absences'} />;
  }

  renderTardiesDashboard(routeProps) {
    return <DashboardLoader schoolId={routeProps.match.params.id} dashboardTarget={'tardies'}/>;
  }

  renderDisciplineDashboard(routeProps) {
    return <DashboardLoader schoolId={routeProps.match.params.id} dashboardTarget={'discipline'}/>;
  }

  renderDistrictEnrollmentPage(routeProps) {
    this.trackVisit(routeProps, 'DISTRICT_ENROLLMENT_PAGE');
    return <DistrictEnrollmentPage />;
  }

  // Ignore this, since we're hybrid client/server and perhaps the
  // server has rendered something and the client-side app just doesn't
  // know about it.
  renderNotFound() {
    console.warn('App: 404'); // eslint-disable-line no-console
    return null;
  }
}

App.childContextTypes = {
  nowFn: PropTypes.func
};

App.propTypes = {
  currentEducator: PropTypes.shape({
    id: PropTypes.number.isRequired,
    admin: PropTypes.bool.isRequired,
    school_id: PropTypes.number,
    labels: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired
};

export default App;
