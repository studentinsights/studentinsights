import React from 'react';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom';
import HomePage from '../app/assets/javascripts/home/HomePage';



// This is the top-level component, only handling routing.
// The core model is still "new page, new load," this just
// handles routing on initial page load for JS code.
class App extends React.Component {
  render() {
    return (
      <Router>
        <div>
          <Route exact path="/home" component={HomePage}/>
          <Route render={() => this.renderNotFound()} />
        </div>
      </Router>
    );
  }

  // TODO(kr)
  // Do nothing (since legacy JS has probably rendered something).
  renderNotFound() {
    return null;
  }
}

export default App;