import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {readEnv} from '../helpers/envForJs';
import datepickerConfig from '../app/assets/javascripts/datepickerConfig';
import sessionTimeoutWarning from '../app/assets/javascripts/sessionTimeoutWarning';
import {initSearchBar, clearStorage} from '../app/assets/javascripts/studentSearchbar';
import legacyRouteHandler from './legacyRouteHandler';
import App from './App';


// Init datepicker
if ($('body').hasClass('students')  ||
    $('body').hasClass('homerooms') ||
    $('body').hasClass('service_uploads') ||
    $('body').hasClass('ui') ||
    $('body').hasClass('school_administrator_dashboard')) {
  datepickerConfig();
}

// Session timeout
if ($('body').hasClass('educator-signed-in')) {
  sessionTimeoutWarning(readEnv().sessionTimeoutInSeconds);
} else {
  clearStorage(); // extra guard that there's no storage if not signed in
}

// Student searchbar, and clearing cache on sign out
if ($('.student-searchbar').length > 0) {
  initSearchBar();
  $('.navbar-sign-out').click(clearStorage);
}

// Routing
// Some pages are server-rendered and have a different structure
// other than #main so we ignore those.  Other pages add in class names
// to the body tag that `legacyRouteHandler` works with.  Newer pages
// should handle routing with react-router inside the `App` component.
// The <BrowserRouter> component is here since that prevents testing <App />.
const mainEl = document.getElementById('main');
if (mainEl) {
  const didRoute = legacyRouteHandler(mainEl);
  if (!didRoute) {
    const serializedData = $('#serialized-data').data() || {};
    const {currentEducator} = serializedData;
    ReactDOM.render(
      <BrowserRouter><App currentEducator={currentEducator} /></BrowserRouter>, mainEl);
  }
}
