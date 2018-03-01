import React from 'react';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom';
import Home from '../app/assets/javascripts/home/Home';



// This is the top-level component, only handling routing.
// The core model is still "new page, new load," this just
// handles routing on initial page load for JS code.
class App extends React.Component {
  render() {
    return (
      <Router>
        <Route exact path="/educators/home" component={Home}/>
        <Route render={() => this.renderNotFound()} />
      </Router>
    );
  }

  // Do nothing (since legacy JS has probably rendered something).
  renderNotFound() {
    return null;
  }
}

export default App;