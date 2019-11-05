import rollbar from 'rollbar';
import {readEnv} from '../app/assets/javascripts/envForJs';


// Load Rollbar.  This file expects readEnv() to work because data
// has been written to the page on boot.
const {
  shouldReportErrors,
  rollbarJsAccessToken,
} = readEnv();
if (shouldReportErrors && rollbarJsAccessToken) loadRollbar();


// Load and configure the library.  Exports it as a global as well.
// Example at https://github.com/rollbar/rollbar.js/blob/master/examples/webpack/src/index.js
function loadRollbar() {
  window.Rollbar = new rollbar({
    enabled: true,
    accessToken: readEnv().rollbarJsAccessToken,
    captureUncaught: true,
    captureUnhandledRejections: true,
    transform: transform, // see note below
    sendConfig: false,

    // Throttle, mostly for limiting the impact of bugs in browser extensions
    itemsPerMinute: 5,
    maxItems: 20,
    ignoreDuplicateErrors: true,

    // Limit the data we send to Rollbar
    captureIp: 'anonymize',
    captureUsername: false,
    captureEmail: false,

    payload: {
      person: null // prevent this from being sent, see also `transform`
    },

    // Nothing should be transmitted automatically and
    // there shouldn't be any sensitive information in URLs or query
    // strings.  This is overly defensive, and tries to prevent any Person
    // information from being sent, even if it does get collected.
    //
    // Ideally we would scrub all fields, but the JS client doesn't support
    // that the way the Ruby client does.
    scrubFields: [
      'person',
      'fingerprint',
      'id',
      
      'student',
      'student_id',
      'first_name',
      'last_name',
      'full_name',
      'name',
      
      'educator',
      'email',
      'username',
      'current_educator',
      'educator_id',
      'currentEducator',

      'search',
      'query',
      'q'
    ],
    
    // We limit the "Telemetry" because of the privacy risk, and
    // some collection is disabled altogether.  That being said,
    // this config also defensively disables individual options 
    // with defaults that are particular concerning for privacy,
    // also explicitly expresses some config even if it matches
    // the current default behavior.
    // For more on Telemetry, see https://docs.rollbar.com/docs/rollbarjs-telemetry
    scrubTelemetryInputs: true,
    includeItemsInTelemetry: true,
    autoInstrument: {
      // Limit data we send.  Although 
      // https://github.com/rollbar/rollbar.js/pull/787 recently improved
      // this, we don't anticipate any debugging value here, so this avoids
      // the privacy risk.
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
// This is lazy because the Rollbar code is loaded in parallel with the code
// that provides `readEnv`.  Reading it lazily on an event avoids having
// to synchronize that code loading.
function transform(payload) {
  payload.environment = readEnv().railsEnvironment;
  payload.districtKey = readEnv().districtKey;
  payload.person = null; // prevent this from being set, overridding the default behavior
}
