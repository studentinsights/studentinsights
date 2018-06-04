// This is a configuration file for Jest
import './sprockets-shims.js';
import '../legacyVendor.js';

// See https://reactjs.org/docs/javascript-environment-requirements.html
import 'raf/polyfill';

// Enzyme support
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-15.4';
Enzyme.configure({ adapter: new Adapter() });

// These are for MountTimer and measurePageLoad.
// See https://gist.github.com/ShirtlessKirk/eb41720a797411defae6
import './performance-timing-api.js';
import {performance} from 'perf_hooks';
global.performance = performance;

// https://github.com/jefflau/jest-fetch-mock
global.fetch = require('jest-fetch-mock'); // eslint-disable-line no-undef

// Make console.warn and error fail tests
console.error = jest.fn(error => { throw new Error(error); }); //eslint-disable-line no-console
console.warn = jest.fn(warn => { throw new Error(warn); }); //eslint-disable-line no-console

// Make test fail if code is reporting errors to Rollbar
window.Rollbar = {
  error: jest.fn(error => { throw new Error(error); }) //eslint-disable-line no-console
};

// flag for GenericLoader to handle failure differently in test
global.GENERIC_LOADER_THROW_ON_REJECT_IN_TEST = true;

// Unhandled promise rejections should fail tests
if (process.listeners('unhandledRejection').length === 0) { // eslint-disable-line no-undef
  process.on('unhandledRejection', error => { // eslint-disable-line no-undef
    console.log('unhandledRejection:', error.message); //eslint-disable-line no-console
    throw error;
  });
}