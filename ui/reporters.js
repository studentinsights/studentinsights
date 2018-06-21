import rollbar from 'rollbar-browser';
import {readEnv} from '../app/assets/javascripts/envForJs';


// Load Rollbar.  This file expects readEnv() to work because data
// has been written to the page on boot.
const {
  shouldReportErrors,
  rollbarJsAccessToken,
} = readEnv();
if (shouldReportErrors && rollbarJsAccessToken) loadRollbar();


// Load and configure the library.  Exports it as a global as well.
function loadRollbar() {
  window.Rollbar = rollbar.init({
    accessToken: readEnv().rollbarJsAccessToken,
    captureUncaught: true,
    captureUnhandledRejections: true,
    transform: transform,
    autoInstrument: {
      // Limit data we send to Rollbar
      log: false,
      dom: false,
      networkResponseHeaders: false,
      networkResponseBody: false,
      networkRequestBody: false,

      // These should contain no data other than URLs
      network: true,
      navigation: true,
      connectivity: true
    }
  });
}

// Add in Rails env info to payload if we're reporting and it exists.
function transform(payload) {
  payload.environment = readEnv().railsEnvironment;
  payload.deploymentKey = readEnv().deploymentKey;
  payload.districtKey = readEnv().districtKey;
}
