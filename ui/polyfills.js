// These are polyfills for ES5/ES6 features that aren't supported in
// IE11.  If we want to use other things like fetch, Map/Set or Array methods,
// add them in here.
//
// These have to be run before other code, so they're included first in the
// webpack build config, rather than `imported` from `index.js`.
//
// Object.assign is particularly tricky since it doesn't come from our source directly,
// but from our Babel transpilation process.
import assign from 'object-assign';
Object.assign = assign;

import Promise from 'promise-polyfill';

if (!window.Promise) {
  window.Promise = Promise;
}

import 'whatwg-fetch';

import 'array.prototype.fill'

// This is for react-beautiful-dnd in IE.
import ArrayFindPolyfill from 'array.prototype.find';
ArrayFindPolyfill.shim();

