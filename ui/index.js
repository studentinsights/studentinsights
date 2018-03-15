import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import datepickerConfig from '../app/assets/javascripts/datepicker_config.js';
import sessionTimeoutWarning from '../app/assets/javascripts/session_timeout_warning.js';
import legacyRouteHandler from './legacyRouteHandler';
import App from './App';
import Navbar from '../app/assets/javascripts/components/Navbar';


// First, run side effects to inject code into window.shared
import './legacy.js';

// Init datepicker
if ($('body').hasClass('students')  ||
    $('body').hasClass('homerooms') ||
    $('body').hasClass('service_uploads') ||
    $('body').hasClass('school_administrator_dashboard')) {
  datepickerConfig();
}

// Session timeout
if ($('body').hasClass('educator-signed-in')) {
  sessionTimeoutWarning(window.shared.Env);
}


// Routing
// Some pages are server-rendered and have a different structure
// other than #main so we ignore those.  Other pages add in class names
// to the body tag that `legacyRouteHandler` works with.  Newer pages
// should handle routing with react-router inside the `App` component.
// The <BrowserRouter> component is here since that prevents testing <App />.
const navbarEl = document.getElementById('navbar');
if (navbarEl) {
  const props = $('#navbar-data').data();
  ReactDOM.render(<Navbar {...props}/>, navbarEl);
}

const mainEl = document.getElementById('main');
if (mainEl) {
  const didRoute = legacyRouteHandler(mainEl);
  if (!didRoute) {
    ReactDOM.render(<BrowserRouter><App /></BrowserRouter>, mainEl);
  }
}