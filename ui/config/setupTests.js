// This is a configuration file for Jest
import './sprockets-shims.js';
import '../legacy.js';

// Enzyme support
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-15.4';
Enzyme.configure({ adapter: new Adapter() });

// https://github.com/jefflau/jest-fetch-mock
global.fetch = require('jest-fetch-mock'); // eslint-disable-line no-undef