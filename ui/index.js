import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {readEnv} from '../app/assets/javascripts/envForJs';
import StudentSearchbar, {clearStorage} from '../app/assets/javascripts/components/StudentSearchbar';
import App from './App';


// Extra guard that there's no browser storage if not signed in
if (!$('body').hasClass('educator-signed-in')) {
  clearStorage(); 
}

// Clear browser cache on sign out
$('.navbar-sign-out').click(clearStorage);

// Add interactive elements to navbar and districtwide page (eg, student searchbar)
document.querySelectorAll('.StudentSearchbar-root').forEach(el => {
  ReactDOM.render(<StudentSearchbar />, el);
});


// Routing
// Some pages are server-rendered and have a different structure
// other than #main so we ignore those.  Newer pages
// should handle routing with react-router inside the `App` component.
// The <BrowserRouter> component is here since that prevents testing <App />.
const mainEl = document.getElementById('main');
if (mainEl) {
  const {districtKey} = readEnv();
  const serializedData = $('#serialized-data').data() || {};
  const {currentEducator} = serializedData;
  const {sessionTimeoutInSeconds} = readEnv();
  const rollbarErrorFn = window.Rollbar.error || console.warn; // eslint-disable-line no-console
  ReactDOM.render(
    <BrowserRouter>
      <App
        rollbarErrorFn={rollbarErrorFn}
        currentEducator={currentEducator}
        districtKey={districtKey}
        sessionTimeoutInSeconds={sessionTimeoutInSeconds} />
    </BrowserRouter>
  , mainEl);
}