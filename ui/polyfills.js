/*
These are polyfills for ES5/ES6 features that aren't supported in
IE11.  If we want to use other things like fetch, Map/Set or Array methods,
add them in here.

These have to be run before other code, so they're included first in the
webpack build config, rather than `imported` from `index.js`.

Over time, we should aim to align to create-react-app.
See https://github.com/facebook/create-react-app/tree/master/packages/react-app-polyfill

For lint support, keep `eslint-plugin-compat` configuration in .eslintrc in sync.
*/


// Object.assign is particularly tricky since it doesn't come from our source directly,
// but from our Babel transpilation process.
import 'core-js/es/object';

// react-beautiful-dnd uses Array#find specifically.
import 'core-js/es/array';

// Promises
import 'core-js/es/promise';

// Polyfill NodeList#forEach for IE11, in order to
// support `document.querySelectorAll(selector).forEach`.
import 'core-js/web/dom-collections';


// For React 16 in IE
// see https://reactjs.org/docs/javascript-environment-requirements.html
import 'core-js/es/map';
import 'core-js/es/set';


// This isn't cross-platform, so not supported by core-js, which recommends
// this polyfill instead.
import 'whatwg-fetch';
