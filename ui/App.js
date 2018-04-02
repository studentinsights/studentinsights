import React from 'react';
import {
  Switch,
  Route
} from 'react-router-dom';
import MixpanelUtils from '../app/assets/javascripts/helpers/mixpanel_utils.jsx';
import HomePage from '../app/assets/javascripts/home/HomePage';
import EducatorPage from '../app/assets/javascripts/educator/EducatorPage';
import TieringPage from '../app/assets/javascripts/tiering/TieringPage';
import SchoolCoursesPage from '../app/assets/javascripts/school_courses/SchoolCoursesPage';


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
      <Switch>
        <Route exact path="/schools/:id/courses" render={this.renderSchoolCoursesPage.bind(this)}/>
        <Route exact path="/educators/view/:id" render={this.renderEducatorPage.bind(this)}/>
        <Route exact path="/home" render={this.renderHomePage.bind(this)}/>
        <Route exact path="/tiering/:school_id" render={this.renderTieringPage.bind(this)}/>
        <Route render={() => this.renderNotFound()} />
      </Switch>
    );
  }

  renderHomePage(routeProps) {
    const {currentEducator} = this.props;
    this.trackVisit(routeProps, 'HOME_PAGE');
    return <HomePage educatorId={currentEducator.id} />;
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

  renderTieringPage(routeProps) {
    const schoolId = routeProps.match.params.school_id;
    this.trackVisit(routeProps, 'TIERING_PAGE');
    return <TieringPage schoolId={schoolId} />;
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
  nowFn: React.PropTypes.func
};
App.propTypes = {
  currentEducator: React.PropTypes.shape({
    id: React.PropTypes.number.isRequired,
    school_id: React.PropTypes.number.isRequired,
    admin: React.PropTypes.bool.isRequired
  }).isRequired
};

export default App;