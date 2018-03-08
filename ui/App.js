import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';
import MixpanelUtils from '../app/assets/javascripts/helpers/mixpanel_utils.jsx';
import HomePage from '../app/assets/javascripts/home/HomePage';



// This is the top-level component, only handling routing.
// The core model is still "new page, new load," this just
// handles routing on initial page load for JS code.
class App extends React.Component {
  // Read which educator Rails wrote inline in the HTML page, 
  // and report routing activity for analytics (eg, MixPanel)
  // TODO(kr) could do this as a higher-order component
  // to remove having to do this manually for each route.
  trackVisit(routeProps, pageKey) {
    const serializedData = $('#serialized-data').data();
    const {currentEducator} = serializedData;
    MixpanelUtils.registerUser(currentEducator);
    MixpanelUtils.track('PAGE_VISIT', { page_key: pageKey });
  }

  // Expects serializedData and navbar, see `ui#ui` on the server
  // side.
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/home" render={() => this.renderHomePage()}/>
          <Route render={() => this.renderNotFound()} />
        </Switch>
      </Router>
    );
  }

  renderHomePage(routeProps) {
    this.trackVisit(routeProps, 'HOME_PAGE');
    return <HomePage />;
  }

  // Ignore this, since we're hybrid client/server and perhaps the 
  // server has rendered something and the client-side app just doesn't
  // know about it.
  renderNotFound() {
    console.log('App: 404'); // eslint-disable-line no-console
    return null;
  }
}

export default App;