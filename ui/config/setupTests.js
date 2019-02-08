// This is a configuration file for Jest
import './sprockets-shims';

// See https://reactjs.org/docs/javascript-environment-requirements.html
import 'raf/polyfill';

// Enzyme support
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });

// These are for MountTimer and measurePageLoad.
// See https://gist.github.com/ShirtlessKirk/eb41720a797411defae6
import './performance-timing-api';
import {performance} from 'perf_hooks';
window.performance = performance;

// See https://github.com/hustcc/jest-canvas-mock#setup-file
import 'jest-canvas-mock';

// https://github.com/jefflau/jest-fetch-mock
window.fetch = require('jest-fetch-mock'); // eslint-disable-line no-undef

// Make console.warn and error fail tests
console.error = jest.fn(error => { throw new Error(error); }); //eslint-disable-line no-console
console.warn = jest.fn(warn => {  //eslint-disable-line no-console
  // separately, work around react-virtualized using wildcard imports that are warnings in react 15.5
  // see also https://github.com/influxdata/chronograf/pull/3098/files
  // and https://github.com/bvaughn/react-virtualized/issues/1037#issuecomment-391707737
  if (warn === 'Warning: Accessing PropTypes via the main React package is deprecated, and will be removed in  React v16.0. Use the latest available v15.* prop-types package from npm instead. For info on usage, compatibility, migration and more, see https://fb.me/prop-types-docs') return;
  if (warn === "Warning: Accessing createClass via the main React package is deprecated, and will be removed in React v16.0. Use a plain JavaScript class instead. If you're not yet ready to migrate, create-react-class v15.* is available on npm as a temporary, drop-in replacement. For more info see https://fb.me/react-create-class") return;
  throw new Error(warn);
});

// Set env for JS stub
window.ENV_FOR_JS = {
  railsEnvironment: 'production',
  sessionTimeoutInSeconds: 21600,
  districtKey: 'demo',
  shouldReportErrors: false,
  rollbarJsAccessToken: null
};

// Make test fail if code is reporting errors to Rollbar
window.Rollbar = {
  error: jest.fn(error => { throw new Error(error); }) //eslint-disable-line no-console
};

// flag for GenericLoader to handle failure differently in test
window.GENERIC_LOADER_THROW_ON_REJECT_IN_TEST = true;

// Unhandled promise rejections should fail tests
if (process.listeners('unhandledRejection').length === 0) { // eslint-disable-line no-undef
  process.on('unhandledRejection', error => { // eslint-disable-line no-undef
    console.log('unhandledRejection:', error.message); //eslint-disable-line no-console
    throw error;
  });
}
