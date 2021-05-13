import {configure} from '@storybook/react';
import '../sprockets-shims';

mockJestFns();

/* eslint-enable no-undef */

// This is enabling sharing setup functions between tests and stories.
// It mocks out Jest functions, so that from a .story.js file, we can
// import a function from a .test.js file.  The way tests are written, this
// import will execute the various blocks of Jest code, and so this prevents that.
function mockJestFns() {
  global.describe = function() {}
  global.beforeEach = function() {}
  global.it = function() {}
  global.jest = {
    fn() {}
  };
}
