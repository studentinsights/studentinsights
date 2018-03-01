import React from 'react';
import ReactDOM from 'react-dom';
import datepickerConfig from '../app/assets/javascripts/datepicker_config.js';
import sessionTimeoutWarning from '../app/assets/javascripts/session_timeout_warning.js';
import studentSearchbar from '../app/assets/javascripts/student_searchbar.js';
import legacyRouteHandler from './legacyRouteHandler';
import App from './App';


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

// Student searchbar
if ($('.student-searchbar').length > 0) {
  studentSearchbar();
}

// Routing
const mainEl = document.getElementById('main');
const didRoute = legacyRouteHandler(mainEl);
if (!didRoute) ReactDOM.render(<App />, mainEl);